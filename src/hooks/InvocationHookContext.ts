// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { LogHandler } from '@azure/functions';
import { InvocationContext } from '../InvocationContext';
import { ReadOnlyError } from '../errors';
import { logHandlerFromContext } from '../log';
import { HookContext } from './HookContext';

export abstract class InvocationHookContext extends HookContext implements types.InvocationHookContext {
    #logHandler: LogHandler;
    #invocationContext: types.InvocationContext;

    constructor(init?: types.InvocationHookContextInit) {
        super(init);
        init = init || {};
        this.#invocationContext = init.invocationContext || new InvocationContext({ logHandler: init.logHandler });
        this.#logHandler = init.logHandler || logHandlerFromContext(this.invocationContext);
    }

    get invocationContext(): types.InvocationContext {
        return this.#invocationContext;
    }

    set invocationContext(_value: types.InvocationContext) {
        throw new ReadOnlyError('invocationContext');
    }

    log(...args: unknown[]): void {
        this.#logHandler('information', ...args);
    }

    trace(...args: unknown[]): void {
        this.#logHandler('trace', ...args);
    }

    debug(...args: unknown[]): void {
        this.#logHandler('debug', ...args);
    }

    info(...args: unknown[]): void {
        this.#logHandler('information', ...args);
    }

    warn(...args: unknown[]): void {
        this.#logHandler('warning', ...args);
    }

    error(...args: unknown[]): void {
        this.#logHandler('error', ...args);
    }
}
