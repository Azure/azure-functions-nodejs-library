// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { RetryContext, TraceContext, TriggerMetadata } from '@azure/functions';
import { RpcInvocationRequest, RpcLog } from '@azure/functions-core';
import { convertKeysToCamelCase } from './converters/convertKeysToCamelCase';
import { fromRpcRetryContext, fromRpcTraceContext } from './converters/fromRpcContext';

export class InvocationContext implements types.InvocationContext {
    invocationId: string;
    functionName: string;
    triggerMetadata: TriggerMetadata;
    traceContext?: TraceContext;
    retryContext?: RetryContext;
    extraInputs: InvocationContextExtraInputs;
    extraOutputs: InvocationContextExtraOutputs;
    #userLogCallback: UserLogCallback;

    constructor(functionName: string, request: RpcInvocationRequest, userLogCallback: UserLogCallback) {
        this.invocationId = <string>request.invocationId;
        this.functionName = functionName;
        this.triggerMetadata = request.triggerMetadata ? convertKeysToCamelCase(request.triggerMetadata) : {};
        if (request.retryContext) {
            this.retryContext = fromRpcRetryContext(request.retryContext);
        }
        if (request.traceContext) {
            this.traceContext = fromRpcTraceContext(request.traceContext);
        }
        this.#userLogCallback = userLogCallback;
        this.extraInputs = new InvocationContextExtraInputs();
        this.extraOutputs = new InvocationContextExtraOutputs();
    }

    log(...args: unknown[]): void {
        this.#userLogCallback(RpcLog.Level.Information, ...args);
    }

    trace(...args: unknown[]): void {
        this.#userLogCallback(RpcLog.Level.Trace, ...args);
    }

    debug(...args: unknown[]): void {
        this.#userLogCallback(RpcLog.Level.Debug, ...args);
    }

    info(...args: unknown[]): void {
        this.#userLogCallback(RpcLog.Level.Information, ...args);
    }

    warn(...args: unknown[]): void {
        this.#userLogCallback(RpcLog.Level.Warning, ...args);
    }

    error(...args: unknown[]): void {
        this.#userLogCallback(RpcLog.Level.Error, ...args);
    }
}

type UserLogCallback = (level: RpcLog.Level, ...args: unknown[]) => void;

class InvocationContextExtraInputs implements types.InvocationContextExtraInputs {
    #inputs: Record<string, unknown> = {};
    get(inputOrName: types.FunctionInput | string): any {
        const name = typeof inputOrName === 'string' ? inputOrName : inputOrName.name;
        return this.#inputs[name];
    }
    set(inputOrName: types.FunctionInput | string, value: unknown): void {
        const name = typeof inputOrName === 'string' ? inputOrName : inputOrName.name;
        this.#inputs[name] = value;
    }
}

class InvocationContextExtraOutputs implements types.InvocationContextExtraOutputs {
    #outputs: Record<string, unknown> = {};
    get(outputOrName: types.FunctionOutput | string): unknown {
        const name = typeof outputOrName === 'string' ? outputOrName : outputOrName.name;
        return this.#outputs[name];
    }
    set(outputOrName: types.FunctionOutput | string, value: unknown): void {
        const name = typeof outputOrName === 'string' ? outputOrName : outputOrName.name;
        this.#outputs[name] = value;
    }
}
