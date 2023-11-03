// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { nonNullProp } from '../utils/nonNull';
import { InvocationHookContext } from './InvocationHookContext';

export class PreInvocationContext extends InvocationHookContext implements types.PreInvocationContext {
    #init: types.PreInvocationContextInit;

    constructor(init?: types.PreInvocationContextInit) {
        super(init);
        this.#init = init ?? {};
        this.#init.functionCallback ??= () => {};
    }

    get functionHandler(): types.FunctionHandler {
        return nonNullProp(this.#init, 'functionCallback');
    }

    set functionHandler(value: types.FunctionHandler) {
        this.#init.functionCallback = value;
    }
}
