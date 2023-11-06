// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { ReadOnlyError } from '../errors';
import { InvocationContext } from '../InvocationContext';
import { nonNullProp } from '../utils/nonNull';
import { HookContext } from './HookContext';

export class InvocationHookContext extends HookContext implements types.InvocationHookContext {
    #init: types.InvocationHookContextInit;

    constructor(init?: types.InvocationHookContextInit) {
        super(init);
        this.#init = init ?? {};
        this.#init.inputs ??= [];
        this.#init.invocationContext ??= new InvocationContext();
    }

    get invocationContext(): types.InvocationContext {
        return nonNullProp(this.#init, 'invocationContext');
    }

    set invocationContext(_value: types.InvocationContext) {
        throw new ReadOnlyError('invocationContext');
    }

    get inputs(): unknown[] {
        return nonNullProp(this.#init, 'inputs');
    }

    set inputs(value: unknown[]) {
        this.#init.inputs = value;
    }
}
