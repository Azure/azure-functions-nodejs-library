// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { InvocationHookContext } from './InvocationHookContext';

export class PostInvocationContext extends InvocationHookContext implements types.PostInvocationContext {
    result: any;
    errorResult: any;

    constructor(init?: types.PostInvocationContextInit) {
        init = init || {};
        super(init);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.result = typeof init.result === 'undefined' ? null : init.result;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.errorResult = typeof init.errorResult === 'undefined' ? null : init.errorResult;
    }
}
