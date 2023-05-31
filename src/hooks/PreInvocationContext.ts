// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { FunctionHandler, PreInvocationContextInit } from '@azure/functions';
import { InvocationHookContext } from './InvocationHookContext';

export class PreInvocationContext extends InvocationHookContext implements types.PreInvocationContext {
    functionCallback: FunctionHandler;

    constructor(init?: PreInvocationContextInit) {
        init = init || {};
        super(init);

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.functionCallback = init.functionCallback || (() => {});
    }
}
