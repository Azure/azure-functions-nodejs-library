// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { FunctionHandler, PreInvocationContextInit, PreInvocationCoreContext } from '@azure/functions';
import { InvocationHookContext } from './InvocationHookContext';

export class PreInvocationContext extends InvocationHookContext implements types.PreInvocationContext {
    #coreCtx: PreInvocationCoreContext;

    constructor(init?: PreInvocationContextInit) {
        super(init);
        init = init || {};
        if (!init.coreContext) {
            init.coreContext = {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                functionCallback: init.functionHandler || (() => {}),
                inputs: init.args || [],
            };
        }
        this.#coreCtx = init.coreContext;
    }

    get functionHandler(): FunctionHandler {
        return this.#coreCtx.functionCallback;
    }

    set functionHandler(value: FunctionHandler) {
        this.#coreCtx.functionCallback = value;
    }

    get args(): any[] {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.#coreCtx.inputs;
    }

    set args(value: any[]) {
        this.#coreCtx.inputs = value;
    }
}
