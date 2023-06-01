// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { LogHandler } from '@azure/functions';
import { InvocationContext } from '../InvocationContext';
import { ReadOnlyError } from '../errors';
import { logHandlerFromContext } from '../log';
import { HookContext } from './HookContext';

export abstract class InvocationHookContext extends HookContext implements types.InvocationHookContext {
    args: any[];
    #userLogHandler: LogHandler;
    #invocationContext: types.InvocationContext;

    constructor(init?: types.PreInvocationContextInit) {
        super(init);
        init = init || {};
        this.args = init.args || [];
        this.#invocationContext = init.invocationContext || new InvocationContext({ logHandler: init.logHandler });
        this.#userLogHandler = init.logHandler || logHandlerFromContext(this.invocationContext);
    }

    get invocationContext(): types.InvocationContext {
        return this.#invocationContext;
    }

    set invocationContext(_value: types.InvocationContext) {
        throw new ReadOnlyError('invocationContext');
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
