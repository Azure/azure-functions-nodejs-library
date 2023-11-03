// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { InvocationHookContext } from './InvocationHookContext';

export class PostInvocationContext extends InvocationHookContext implements types.PostInvocationContext {
    #init: types.PostInvocationContextInit;

    constructor(init?: types.PostInvocationContextInit) {
        super(init);
        this.#init = init ?? {};
    }

    get result(): unknown {
        return this.#init.result;
    }

    set result(value: unknown) {
        this.#init.result = value;
    }

    get error(): unknown {
        return this.#init.error;
    }

    set error(value: unknown) {
        this.#init.error = value;
    }
}
