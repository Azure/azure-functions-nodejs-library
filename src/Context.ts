// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Context, ContextBindings, Logger, RetryContext, TraceContext, TriggerMetadata } from '@azure/functions';
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
        context: <Context>context,
        inputs: inputs,
    };
}

class InvocationContext implements Context {
    invocationId: string;
    functionName: string;
    bindings: ContextBindings;
    triggerMetadata: TriggerMetadata;
    traceContext?: TraceContext;
    retryContext?: RetryContext;
    log: Logger;
    req?: Request;
    res?: Response;

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

        this.bindings = {};

        // Log message that is tied to function invocation
        this.log = Object.assign((...args: any[]) => userLogCallback(RpcLog.Level.Information, ...args), {
            error: (...args: any[]) => userLogCallback(RpcLog.Level.Error, ...args),
            warn: (...args: any[]) => userLogCallback(RpcLog.Level.Warning, ...args),
            info: (...args: any[]) => userLogCallback(RpcLog.Level.Information, ...args),
            verbose: (...args: any[]) => userLogCallback(RpcLog.Level.Trace, ...args),
        });
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
