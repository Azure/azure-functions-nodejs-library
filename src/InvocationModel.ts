// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionHandler } from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import {
    CoreInvocationContext,
    InvocationArguments,
    RpcBindingInfo,
    RpcInvocationResponse,
    RpcLog,
    RpcTypedData,
} from '@azure/functions-core';
import { format } from 'util';
import { returnBindingKey } from './constants';
import { convertKeysToCamelCase } from './converters/convertKeysToCamelCase';
import { fromRpcTypedData } from './converters/fromRpcTypedData';
import { toRpcHttp } from './converters/toRpcHttp';
import { toRpcTypedData } from './converters/toRpcTypedData';
import { HttpRequest } from './http/HttpRequest';
import { InvocationContext } from './InvocationContext';
import { nonNullProp } from './utils/nonNull';

export class InvocationModel implements coreTypes.InvocationModel {
    #isDone = false;
    #coreCtx: CoreInvocationContext;
    #functionName: string;
    #bindings: Record<string, RpcBindingInfo>;

    constructor(coreCtx: CoreInvocationContext) {
        this.#coreCtx = coreCtx;
        this.#functionName = nonNullProp(coreCtx.metadata, 'name');
        this.#bindings = nonNullProp(coreCtx.metadata, 'bindings');
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getArguments(): Promise<InvocationArguments> {
        const context = new InvocationContext(
            this.#functionName,
            this.#coreCtx.request,
            (level: RpcLog.Level, ...args: unknown[]) => this.#userLog(level, ...args)
        );

        const inputs: any[] = [];
        if (this.#coreCtx.request.inputData) {
            for (const binding of this.#coreCtx.request.inputData) {
                if (binding.data && binding.name) {
                    let input: any;
                    const bindingType = this.#bindings[binding.name].type?.toLowerCase();
                    if (binding.data.http) {
                        input = new HttpRequest(binding.data.http);
                    } else if (bindingType === 'timertrigger') {
                        // TODO: Don't hard code fix for camelCase https://github.com/Azure/azure-functions-nodejs-worker/issues/188
                        input = convertKeysToCamelCase(binding.data);
                    } else {
                        input = fromRpcTypedData(binding.data);
                    }

                    if (bindingType && /trigger/i.test(bindingType)) {
                        inputs.push(input);
                    } else {
                        context.extraInputs.set(binding.name, input);
                    }
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
            if (binding.direction === RpcBindingInfo.Direction.out) {
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

        return response;
    }

    #convertOutput(binding: RpcBindingInfo, value: unknown): RpcTypedData | null | undefined {
        if (binding.type?.toLowerCase() === 'http') {
            return toRpcHttp(value);
        } else {
            return toRpcTypedData(value);
        }
    }

    #log(level: RpcLog.Level, logCategory: RpcLog.RpcLogCategory, ...args: unknown[]): void {
        this.#coreCtx.log(level, logCategory, format(...args));
    }

    #systemLog(level: RpcLog.Level, ...args: unknown[]) {
        this.#log(level, RpcLog.RpcLogCategory.System, ...args);
    }

    #userLog(level: RpcLog.Level, ...args: unknown[]): void {
        if (this.#isDone && this.#coreCtx.state !== 'postInvocationHooks') {
            let badAsyncMsg =
                "Warning: Unexpected call to 'log' on the context object after function execution has completed. Please check for asynchronous calls that are not awaited. ";
            badAsyncMsg += `Function name: ${this.#functionName}. Invocation Id: ${this.#coreCtx.invocationId}.`;
            this.#systemLog(RpcLog.Level.Warning, badAsyncMsg);
        }
        this.#log(level, RpcLog.RpcLogCategory.User, ...args);
    }
}
