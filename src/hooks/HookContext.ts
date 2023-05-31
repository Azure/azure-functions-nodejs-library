// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HookContextInit, HookData } from '@azure/functions';

export abstract class HookContext implements types.HookContext {
    readonly hookData: HookData;
    readonly appHookData: HookData;

    constructor(init?: HookContextInit) {
        init = init || {};
        this.hookData = init.hookData || {};
        this.appHookData = init.appHookData || {};
    }
}
