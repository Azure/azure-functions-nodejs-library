// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

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
import { fromRpcBindings } from './converters/fromRpcBindings';
import { fromRpcRetryContext, fromRpcTraceContext } from './converters/fromRpcContext';
import { fromRpcTriggerMetadata } from './converters/fromRpcTriggerMetadata';
import { fromRpcTypedData } from './converters/fromRpcTypedData';
import { toCamelCaseValue } from './converters/toCamelCase';
import { toRpcHttp } from './converters/toRpcHttp';
import { toRpcTypedData } from './converters/toRpcTypedData';
import { AzFuncSystemError } from './errors';
import { waitForProxyRequest } from './http/httpProxy';
import { createStreamRequest } from './http/HttpRequest';
import { InvocationContext } from './InvocationContext';
import { enableHttpStream } from './setup';
import { isHttpTrigger, isTimerTrigger, isTrigger } from './utils/isTrigger';
import { isDefined, nonNullProp, nonNullValue } from './utils/nonNull';

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
            options: fromRpcBindings(this.#bindings),
        });

        const inputs: unknown[] = [];
        if (req.inputData) {
            for (const binding of req.inputData) {
                const bindingName = nonNullProp(binding, 'name');

                const rpcBinding = this.#bindings[bindingName];
                if (!rpcBinding) {
                    throw new AzFuncSystemError(
                        `Failed to find binding "${bindingName}" in bindings "${Object.keys(this.#bindings).join(
                            ', '
                        )}".`
                    );
                }
                const bindingType = rpcBinding.type;

                let input: unknown;
                if (isHttpTrigger(bindingType) && enableHttpStream) {
                    const proxyRequest = await waitForProxyRequest(this.#coreCtx.invocationId);
                    input = createStreamRequest(proxyRequest, nonNullProp(req, 'triggerMetadata'));
                } else {
                    input = fromRpcTypedData(binding.data);
                }

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

    async invokeFunction(
        context: InvocationContext,
        inputs: unknown[],
        handler: coreTypes.FunctionCallback
    ): Promise<unknown> {
        try {
            return await Promise.resolve(handler(...inputs, context));
        } finally {
            this.#isDone = true;
        }
    }

    async getResponse(context: InvocationContext, result: unknown): Promise<RpcInvocationResponse> {
        const response: RpcInvocationResponse = { invocationId: this.#coreCtx.invocationId };

        response.outputData = [];
        let usedReturnValue = false;
        for (const [name, binding] of Object.entries(this.#bindings)) {
            if (binding.direction === 'out') {
                if (name === returnBindingKey) {
                    response.returnValue = await this.#convertOutput(context.invocationId, binding, result);
                    usedReturnValue = true;
                } else {
                    const outputValue = await this.#convertOutput(
                        context.invocationId,
                        binding,
                        context.extraOutputs.get(name)
                    );
                    if (isDefined(outputValue)) {
                        response.outputData.push({ name, data: outputValue });
                    }
                }
            }
        }

        // This allows the return value of non-HTTP triggered functions to be passed back
        // to the host, even if no explicit output binding is set. In most cases, this is ignored,
        // but e.g., Durable uses this to pass orchestrator state back to the Durable extension, w/o
        // an explicit output binding. See here for more details: https://github.com/Azure/azure-functions-nodejs-library/pull/25
        if (!usedReturnValue && !isHttpTrigger(this.#triggerType)) {
            response.returnValue = toRpcTypedData(result);
        }

        return response;
    }

    async #convertOutput(
        invocationId: string,
        binding: RpcBindingInfo,
        value: unknown
    ): Promise<RpcTypedData | null | undefined> {
        if (binding.type?.toLowerCase() === 'http') {
            return toRpcHttp(invocationId, value);
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
