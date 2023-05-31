// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HookData, InvocationContext, LogHandler } from '@azure/functions';
import { logHandlerFromContext } from '../log';
import { HookContext } from './HookContext';

export abstract class InvocationHookContext extends HookContext implements types.InvocationHookContext {
    readonly hookData: HookData;
    readonly appHookData: HookData;
    readonly invocationContext: InvocationContext;
    args: any[];
    #userLogHandler: LogHandler;

    constructor(init?: types.PreInvocationContextInit) {
        super(init);
        init = init || {};
        this.hookData = init.hookData || {};
        this.appHookData = init.appHookData || {};
        this.args = init.args || [];
        this.invocationContext = init.invocationContext || new InvocationContext({ logHandler: init.logHandler });
        this.#userLogHandler = init.logHandler || logHandlerFromContext(this.invocationContext);
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
