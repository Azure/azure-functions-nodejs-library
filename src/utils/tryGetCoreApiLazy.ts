// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as coreTypes from '@azure/functions-core';

let coreApi: typeof coreTypes | undefined | null;
export function tryGetCoreApiLazy(): typeof coreTypes | null {
    if (coreApi === undefined) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            coreApi = <typeof coreTypes>require('@azure/functions-core');
        } catch {
            coreApi = null;
        }
    }
    return coreApi;
}
