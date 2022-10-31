// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionHandler } from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import {
    CoreInvocationContext,
    InvocationArguments,
    RpcBindingInfo,
    RpcInvocationResponse,
    RpcLogCategory,
    RpcLogLevel,
    RpcTypedData,
} from '@azure/functions-core';
import { format } from 'util';
import { returnBindingKey } from './constants';
import { fromRpcRetryContext, fromRpcTraceContext } from './converters/fromRpcContext';
import { fromRpcTriggerMetadata } from './converters/fromRpcTriggerMetadata';
import { fromRpcTypedData } from './converters/fromRpcTypedData';
import { toCamelCaseValue } from './converters/toCamelCase';
import { toRpcHttp } from './converters/toRpcHttp';
import { toRpcTypedData } from './converters/toRpcTypedData';
import { InvocationContext } from './InvocationContext';
import { isHttpTrigger, isTimerTrigger, isTrigger } from './utils/isTrigger';
import { nonNullProp, nonNullValue } from './utils/nonNull';

export class InvocationModel implements coreTypes.InvocationModel {
    #isDone = false;
    #coreCtx: CoreInvocationContext;
    #functionName: string;
    #bindings: Record<string, RpcBindingInfo>;
    #triggerType: string;

    constructor(coreCtx: CoreInvocationContext) {
        this.#coreCtx = coreCtx;
        this.#functionName = nonNullProp(coreCtx.metadata, 'name');
        this.#bindings = nonNullProp(coreCtx.metadata, 'bindings');
        const triggerBinding = nonNullValue(
            Object.values(this.#bindings).find((b) => isTrigger(b.type)),
            'triggerBinding'
        );
        this.#triggerType = nonNullProp(triggerBinding, 'type');
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getArguments(): Promise<InvocationArguments> {
        const req = this.#coreCtx.request;

        const context = new InvocationContext({
            invocationId: nonNullProp(this.#coreCtx, 'invocationId'),
            functionName: this.#functionName,
            logHandler: (level: RpcLogLevel, ...args: unknown[]) => this.#userLog(level, ...args),
            retryContext: fromRpcRetryContext(req.retryContext),
            traceContext: fromRpcTraceContext(req.traceContext),
            triggerMetadata: fromRpcTriggerMetadata(req.triggerMetadata, this.#triggerType),
        });

        const inputs: unknown[] = [];
        if (req.inputData) {
            for (const binding of req.inputData) {
                const bindingName = nonNullProp(binding, 'name');
                let input: unknown = fromRpcTypedData(binding.data);

                const bindingType = this.#bindings[bindingName].type;
                if (isTimerTrigger(bindingType)) {
                    input = toCamelCaseValue(input);
                }

                if (isTrigger(bindingType)) {
                    inputs.push(input);
                } else {
                    context.extraInputs.set(bindingName, input);
                }
            }
        }

        return { context, inputs };
    }

    async invokeFunction(context: InvocationContext, inputs: unknown[], handler: FunctionHandler): Promise<unknown> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await Promise.resolve(handler(context, inputs[0]));
        } finally {
            this.#isDone = true;
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getResponse(context: InvocationContext, result: unknown): Promise<RpcInvocationResponse> {
        const response: RpcInvocationResponse = { invocationId: this.#coreCtx.invocationId };

        response.outputData = [];
        for (const [name, binding] of Object.entries(this.#bindings)) {
            if (binding.direction === 'out') {
                if (name === returnBindingKey) {
                    response.returnValue = this.#convertOutput(binding, result);
                } else {
                    response.outputData.push({
                        name,
                        data: this.#convertOutput(binding, context.extraOutputs.get(name)),
                    });
                }
            }
        }

        if (!response.returnValue && response.outputData.length == 0 && !isHttpTrigger(this.#triggerType)) {
            response.returnValue = toRpcTypedData(result);
        }

        return response;
    }

    #convertOutput(binding: RpcBindingInfo, value: unknown): RpcTypedData | null | undefined {
        if (binding.type?.toLowerCase() === 'http') {
            return toRpcHttp(value);
        } else {
            return toRpcTypedData(value);
        }
    }

    #log(level: RpcLogLevel, logCategory: RpcLogCategory, ...args: unknown[]): void {
        this.#coreCtx.log(level, logCategory, format(...args));
    }

    #systemLog(level: RpcLogLevel, ...args: unknown[]) {
        this.#log(level, 'system', ...args);
    }

    #userLog(level: RpcLogLevel, ...args: unknown[]): void {
        if (this.#isDone && this.#coreCtx.state !== 'postInvocationHooks') {
            let badAsyncMsg =
                "Warning: Unexpected call to 'log' on the context object after function execution has completed. Please check for asynchronous calls that are not awaited. ";
            badAsyncMsg += `Function name: ${this.#functionName}. Invocation Id: ${this.#coreCtx.invocationId}.`;
            this.#systemLog('warning', badAsyncMsg);
        }
        this.#log(level, 'user', ...args);
    }
}
