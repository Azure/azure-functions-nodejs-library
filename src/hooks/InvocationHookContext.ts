// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { InvocationContext } from '../InvocationContext';
import { ReadOnlyError } from '../errors';
import { HookContext } from './HookContext';

export abstract class InvocationHookContext extends HookContext implements types.InvocationHookContext {
    #invocationContext: types.InvocationContext;

    constructor(init?: types.InvocationHookContextInit) {
        super(init);
        init = init || {};
        this.#invocationContext = init.invocationContext || new InvocationContext({});
    }

    get invocationContext(): types.InvocationContext {
        return this.#invocationContext;
    }

    set invocationContext(_value: types.InvocationContext) {
        throw new ReadOnlyError('invocationContext');
    }
}
