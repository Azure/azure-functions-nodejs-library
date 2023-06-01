// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { PostInvocationCoreContext } from '@azure/functions';
import { InvocationHookContext } from './InvocationHookContext';

export class PostInvocationContext extends InvocationHookContext implements types.PostInvocationContext {
    #coreCtx: PostInvocationCoreContext;

    constructor(init?: types.PostInvocationContextInit) {
        super(init);
        init = init || {};
        if (!init.coreContext) {
            init.coreContext = {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                result: typeof init.result === 'undefined' ? null : init.errorResult,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                error: typeof init.errorResult === 'undefined' ? null : init.errorResult,
                inputs: init.args || [],
            };
        }

        this.#coreCtx = init.coreContext;
    }

    get args(): any[] {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.#coreCtx.inputs;
    }

    set args(value: any[]) {
        this.#coreCtx.inputs = value;
    }

    get result(): any {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.#coreCtx.result;
    }

    set result(value: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.#coreCtx.result = value;
    }

    get errorResult(): any {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.#coreCtx.error;
    }

    set errorResult(value: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.#coreCtx.error = value;
    }
}
