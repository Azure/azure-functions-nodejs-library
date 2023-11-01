// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { ReadOnlyError } from '../errors';
import { nonNullProp } from '../utils/nonNull';

export class HookContext implements types.HookContext {
    #init: types.HookContextInit;

    constructor(init?: types.HookContextInit) {
        this.#init = init ?? {};
        this.#init.hookData ??= {};
    }

    get hookData(): Record<string, unknown> {
        return nonNullProp(this.#init, 'hookData');
    }

    set hookData(_value: unknown) {
        throw new ReadOnlyError('hookData');
    }
}
