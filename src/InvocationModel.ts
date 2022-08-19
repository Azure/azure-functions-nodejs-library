// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { AzureFunction, Context } from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import {
    CoreInvocationContext,
    InvocationArguments,
    RpcInvocationResponse,
    RpcLog,
    RpcParameterBinding,
} from '@azure/functions-core';
import { format } from 'util';
import { CreateContextAndInputs } from './Context';
import { toTypedData } from './converters/RpcConverters';
import { FunctionInfo } from './FunctionInfo';

export class InvocationModel implements coreTypes.InvocationModel {
    #isDone = false;
    #coreCtx: CoreInvocationContext;
    #funcInfo: FunctionInfo;

    constructor(coreCtx: CoreInvocationContext) {
        this.#coreCtx = coreCtx;
        this.#funcInfo = new FunctionInfo(coreCtx.metadata);
    }

    async getArguments(): Promise<InvocationArguments> {
        const { context, inputs } = CreateContextAndInputs(
            this.#funcInfo,
            this.#coreCtx.request,
            (level: RpcLog.Level, ...args: any[]) => this.#userLog(level, ...args)
        );
        return { context, inputs };
    }

    async invokeFunction(context: Context, inputs: unknown[], functionCallback: AzureFunction): Promise<unknown> {
        try {
            return await Promise.resolve(functionCallback(context, ...inputs));
        } finally {
            this.#isDone = true;
        }
    }

    async getResponse(context: Context, result: unknown): Promise<RpcInvocationResponse> {
        const response: RpcInvocationResponse = { invocationId: this.#coreCtx.invocationId };
        response.outputData = [];
        const info = this.#funcInfo;

        // Allow HTTP response from context.res if HTTP response is not defined from the context.bindings object
        if (info.httpOutputName && context.res && context.bindings[info.httpOutputName] === undefined) {
            context.bindings[info.httpOutputName] = context.res;
        }

        // As legacy behavior, falsy values get serialized to `null` in AzFunctions.
        // This breaks Durable Functions expectations, where customers expect any
        // JSON-serializable values to be preserved by the framework,
        // so we check if we're serializing for durable and, if so, ensure falsy
        // values get serialized.
        const isDurableBinding = info?.bindings?.name?.type == 'activityTrigger';

        const returnBinding = info.getReturnBinding();
        // Set results from return
        if (result || (isDurableBinding && result != null)) {
            // $return binding is found: return result data to $return binding
            if (returnBinding) {
                response.returnValue = returnBinding.converter(result);
                // $return binding is not found: read result as object of outputs
            } else if (typeof result === 'object') {
                response.outputData = Object.keys(info.outputBindings)
                    .filter((key) => result[key] !== undefined)
                    .map(
                        (key) =>
                            <RpcParameterBinding>{
                                name: key,
                                data: info.outputBindings[key].converter(result[key]),
                            }
                    );
            }
            // returned value does not match any output bindings (named or $return)
            // if not http, pass along value
            if (!response.returnValue && response.outputData.length == 0 && !info.hasHttpTrigger) {
                response.returnValue = toTypedData(result);
            }
        }
        // Set results from context.bindings
        if (context.bindings) {
            response.outputData = response.outputData.concat(
                Object.keys(info.outputBindings)
                    // Data from return prioritized over data from context.bindings
                    .filter((key) => {
                        const definedInBindings: boolean = context.bindings[key] !== undefined;
                        const hasReturnValue = !!result;
                        const hasReturnBinding = !!returnBinding;
                        const definedInReturn: boolean =
                            hasReturnValue &&
                            !hasReturnBinding &&
                            typeof result === 'object' &&
                            result[key] !== undefined;
                        return definedInBindings && !definedInReturn;
                    })
                    .map(
                        (key) =>
                            <RpcParameterBinding>{
                                name: key,
                                data: info.outputBindings[key].converter(context.bindings[key]),
                            }
                    )
            );
        }
        return response;
    }

    #log(level: RpcLog.Level, logCategory: RpcLog.RpcLogCategory, ...args: any[]): void {
        this.#coreCtx.log(level, logCategory, format.apply(null, <[any, any[]]>args));
    }

    #systemLog(level: RpcLog.Level, ...args: any[]) {
        this.#log(level, RpcLog.RpcLogCategory.System, ...args);
    }

    #userLog(level: RpcLog.Level, ...args: any[]): void {
        if (this.#isDone && this.#coreCtx.state !== 'postInvocationHooks') {
            let badAsyncMsg =
                "Warning: Unexpected call to 'log' on the context object after function execution has completed. Please check for asynchronous calls that are not awaited. ";
            badAsyncMsg += `Function name: ${this.#funcInfo.name}. Invocation Id: ${this.#coreCtx.invocationId}.`;
            this.#systemLog(RpcLog.Level.Warning, badAsyncMsg);
        }
        this.#log(level, RpcLog.RpcLogCategory.User, ...args);
    }
}
