// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { InvocationContextInit, LogHandler, RetryContext, TraceContext, TriggerMetadata } from '@azure/functions';

export class InvocationContext implements types.InvocationContext {
    invocationId: string;
    functionName: string;
    extraInputs: InvocationContextExtraInputs;
    extraOutputs: InvocationContextExtraOutputs;
    retryContext?: RetryContext;
    traceContext?: TraceContext;
    triggerMetadata?: TriggerMetadata;
    #userLogHandler: LogHandler;

    constructor(init: InvocationContextInit) {
        this.invocationId = init.invocationId;
        this.functionName = init.functionName;
        this.extraInputs = new InvocationContextExtraInputs();
        this.extraOutputs = new InvocationContextExtraOutputs();
        this.retryContext = init.retryContext;
        this.traceContext = init.traceContext;
        this.triggerMetadata = init.triggerMetadata;
        this.#userLogHandler = init.logHandler;
    }

    log(...args: unknown[]): void {
        this.#userLogHandler('information', ...args);
    }

    trace(...args: unknown[]): void {
        this.#userLogHandler('trace', ...args);
    }

    debug(...args: unknown[]): void {
        this.#userLogHandler('debug', ...args);
    }

    info(...args: unknown[]): void {
        this.#userLogHandler('information', ...args);
    }

    warn(...args: unknown[]): void {
        this.#userLogHandler('warning', ...args);
    }

    error(...args: unknown[]): void {
        this.#userLogHandler('error', ...args);
    }
}

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