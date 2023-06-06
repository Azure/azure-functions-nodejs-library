// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HookContextInit, HookData } from '@azure/functions';

export class HookContext implements types.HookContext {
    #hookData: HookData;
    #appHookData: HookData;

    constructor(init?: HookContextInit) {
        init = init || {};
        this.#hookData = init.hookData || {};
        this.#appHookData = init.appHookData || {};
        Object.assign(this, init);
    }

    get(propertyName: string): unknown {
        return this.#hookData[propertyName];
    }

    set(propertyName: string, value: unknown): void {
        this.#hookData[propertyName] = value;
    }

    getGlobal(propertyName: string): unknown {
        return this.#appHookData[propertyName];
    }

    setGlobal(propertyName: string, value: unknown): void {
        this.#appHookData[propertyName] = value;
    }
}
