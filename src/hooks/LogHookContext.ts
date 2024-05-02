// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { ReadOnlyError } from '../errors';
import { nonNullProp } from '../utils/nonNull';
import { HookContext } from './HookContext';

export class LogHookContext extends HookContext implements types.LogHookContext {
    #init: types.LogHookContextInit;

    constructor(init?: types.LogHookContextInit) {
        super(init);
        this.#init = init ?? {};
        this.#init.level ??= 'information';
        this.#init.message ??= 'unknown';
        this.#init.category ??= 'user';
    }

    get level(): types.LogLevel {
        return nonNullProp(this.#init, 'level');
    }

    set level(value: types.LogLevel) {
        this.#init.level = value;
    }

    get message(): string {
        return nonNullProp(this.#init, 'message');
    }

    set message(value: string) {
        this.#init.message = value;
    }

    get category(): types.LogCategory {
        return nonNullProp(this.#init, 'category');
    }

    set category(_value: types.LogCategory) {
        throw new ReadOnlyError('category');
    }

    get invocationContext(): types.InvocationContext | undefined {
        return this.#init.invocationContext;
    }

    set invocationContext(_value: types.InvocationContext | undefined) {
        throw new ReadOnlyError('invocationContext');
    }
}
