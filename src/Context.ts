// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    BindingDefinition,
    Context,
    ContextBindingData,
    ContextBindings,
    ExecutionContext,
    Logger,
    TraceContext,
} from '@azure/functions';
import { RpcInvocationRequest, RpcLog, RpcParameterBinding } from '@azure/functions-core';
import { v4 as uuid } from 'uuid';
import {
    convertKeysToCamelCase,
    getBindingDefinitions,
    getNormalizedBindingData,
} from './converters/BindingConverters';
import { fromRpcTraceContext, fromTypedData } from './converters/RpcConverters';
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
        // This is added for backwards compatability with what the host used to send to the worker
        context.bindingData.sys = {
            methodName: info.name,
            utcNow: new Date().toISOString(),
            randGuid: uuid(),
        };
        // Populate from HTTP request for backwards compatibility if missing
        if (!context.bindingData.query) {
            context.bindingData.query = Object.assign({}, httpInput.query);
        }
        if (!context.bindingData.headers) {
            context.bindingData.headers = Object.assign({}, httpInput.headers);
        }
    }
    return {
        context: <Context>context,
        inputs: inputs,
    };
}

class InvocationContext implements Context {
    invocationId: string;
    executionContext: ExecutionContext;
    bindings: ContextBindings;
    bindingData: ContextBindingData;
    traceContext: TraceContext;
    bindingDefinitions: BindingDefinition[];
    log: Logger;
    req?: Request;
    res?: Response;

    constructor(info: FunctionInfo, request: RpcInvocationRequest, userLogCallback: UserLogCallback) {
        this.invocationId = <string>request.invocationId;
        this.traceContext = fromRpcTraceContext(request.traceContext);
        const executionContext = <ExecutionContext>{
            invocationId: this.invocationId,
            functionName: info.name,
            functionDirectory: info.directory,
            retryContext: request.retryContext,
        };
        this.executionContext = executionContext;
        this.bindings = {};

        // Log message that is tied to function invocation
        this.log = Object.assign((...args: any[]) => userLogCallback(RpcLog.Level.Information, ...args), {
            error: (...args: any[]) => userLogCallback(RpcLog.Level.Error, ...args),
            warn: (...args: any[]) => userLogCallback(RpcLog.Level.Warning, ...args),
            info: (...args: any[]) => userLogCallback(RpcLog.Level.Information, ...args),
            verbose: (...args: any[]) => userLogCallback(RpcLog.Level.Trace, ...args),
        });

        this.bindingData = getNormalizedBindingData(request);
        this.bindingDefinitions = getBindingDefinitions(info);
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
