// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HookContextInit, HookData } from '@azure/functions';
import { ReadOnlyError } from '../errors';

export abstract class HookContext implements types.HookContext {
    #hookData: HookData;
    #appHookData: HookData;

    constructor(init?: HookContextInit) {
        init = init || {};
        this.#hookData = init.hookData || {};
        this.#appHookData = init.appHookData || {};
    }

    get hookData(): HookData {
        return this.#hookData;
    }

    set hookData(_value: HookData) {
        throw new ReadOnlyError('hookData');
    }

    get appHookData(): HookData {
        return this.#appHookData;
    }

    set appHookData(_value: HookData) {
        throw new ReadOnlyError('appHookData');
    }
}
