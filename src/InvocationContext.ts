// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { ContextBindings, RetryContext, TraceContext, TriggerMetadata } from '@azure/functions';
import { RpcInvocationRequest, RpcLog, RpcParameterBinding } from '@azure/functions-core';
import { convertKeysToCamelCase } from './converters/convertKeysToCamelCase';
import { fromRpcRetryContext, fromRpcTraceContext, fromTypedData } from './converters/RpcConverters';
import { FunctionInfo } from './FunctionInfo';
import { Request } from './http/Request';
import { Response } from './http/Response';

export function CreateContextAndInputs(
    info: FunctionInfo,
    request: RpcInvocationRequest,
    userLogCallback: UserLogCallback
) {
    const context = new InvocationContext(info, request, userLogCallback);

    const bindings: ContextBindings = {};
    const inputs: any[] = [];
    let httpInput: Request | undefined;
    for (const binding of <RpcParameterBinding[]>request.inputData) {
        if (binding.data && binding.name) {
            let input;
            if (binding.data && binding.data.http) {
                input = httpInput = new Request(binding.data.http);
            } else {
                // TODO: Don't hard code fix for camelCase https://github.com/Azure/azure-functions-nodejs-worker/issues/188
                if (info.getTimerTriggerName() === binding.name) {
                    // v2 worker converts timer trigger object to camelCase
                    input = convertKeysToCamelCase(binding)['data'];
                } else {
                    input = fromTypedData(binding.data);
                }
            }
            bindings[binding.name] = input;
            inputs.push(input);
        }
    }

    context.bindings = bindings;
    if (httpInput) {
        context.req = httpInput;
        context.res = new Response();
    }

    return {
        context: <types.InvocationContext>context,
        inputs: inputs,
    };
}

class InvocationContext implements types.InvocationContext {
    invocationId: string;
    functionName: string;
    bindings: ContextBindings;
    triggerMetadata: TriggerMetadata;
    traceContext?: TraceContext;
    retryContext?: RetryContext;
    req?: Request;
    res?: Response;
    #userLogCallback: UserLogCallback;

    constructor(info: FunctionInfo, request: RpcInvocationRequest, userLogCallback: UserLogCallback) {
        this.invocationId = <string>request.invocationId;
        this.functionName = info.name;
        this.triggerMetadata = request.triggerMetadata ? convertKeysToCamelCase(request.triggerMetadata) : {};
        if (request.retryContext) {
            this.retryContext = fromRpcRetryContext(request.retryContext);
        }
        if (request.traceContext) {
            this.traceContext = fromRpcTraceContext(request.traceContext);
        }
        this.#userLogCallback = userLogCallback;

        this.bindings = {};
    }

    log(...args: any[]): void {
        this.#userLogCallback(RpcLog.Level.Information, ...args);
    }

    trace(...args: any[]): void {
        this.#userLogCallback(RpcLog.Level.Trace, ...args);
    }

    debug(...args: any[]): void {
        this.#userLogCallback(RpcLog.Level.Debug, ...args);
    }

    info(...args: any[]): void {
        this.#userLogCallback(RpcLog.Level.Information, ...args);
    }

    warn(...args: any[]): void {
        this.#userLogCallback(RpcLog.Level.Warning, ...args);
    }

    error(...args: any[]): void {
        this.#userLogCallback(RpcLog.Level.Error, ...args);
    }
}

export interface InvocationResult {
    return: any;
    bindings: ContextBindings;
}

export type UserLogCallback = (level: RpcLog.Level, ...args: any[]) => void;

export interface Dict<T> {
    [key: string]: T;
}
