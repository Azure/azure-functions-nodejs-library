// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import {
    EffectiveFunctionOptions,
    InvocationContextInit,
    LogHandler,
    RetryContext,
    TraceContext,
    TriggerMetadata,
} from '@azure/functions';

export class InvocationContext implements types.InvocationContext {
    invocationId: string;
    functionName: string;
    extraInputs: InvocationContextExtraInputs;
    extraOutputs: InvocationContextExtraOutputs;
    retryContext?: RetryContext;
    traceContext?: TraceContext;
    triggerMetadata?: TriggerMetadata;
    options: EffectiveFunctionOptions;
    #userLogHandler: LogHandler;

    constructor(init?: InvocationContextInit) {
        init = init || {};
        const fallbackString = 'unknown';
        this.invocationId = init.invocationId || fallbackString;
        this.functionName = init.functionName || fallbackString;
        this.extraInputs = new InvocationContextExtraInputs();
        this.extraOutputs = new InvocationContextExtraOutputs();
        this.retryContext = init.retryContext;
        this.traceContext = init.traceContext;
        this.triggerMetadata = init.triggerMetadata;
        this.options = {
            trigger: init.options?.trigger || {
                name: fallbackString,
                type: fallbackString,
            },
            return: init.options?.return,
            extraInputs: init.options?.extraInputs || [],
            extraOutputs: init.options?.extraOutputs || [],
        };
        this.#userLogHandler = init.logHandler || fallbackLogHandler;
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

function fallbackLogHandler(level: types.LogLevel, ...args: unknown[]): void {
    switch (level) {
        case 'trace':
            console.trace(...args);
            break;
        case 'debug':
            console.debug(...args);
            break;
        case 'information':
            console.info(...args);
            break;
        case 'warning':
            console.warn(...args);
            break;
        case 'critical':
        case 'error':
            console.error(...args);
            break;
        default:
            console.log(...args);
    }
}
