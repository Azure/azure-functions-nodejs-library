// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { SetupOptions } from '../types';
import { AzFuncSystemError } from './errors';
import { tryGetCoreApiLazy } from './utils/tryGetCoreApiLazy';
import { workerSystemLog } from './utils/workerSystemLog';

let options: SetupOptions = {};
let setupLocked = false;

export function lockSetup(): void {
    setupLocked = true;
}

export function setup(opts: SetupOptions): void {
    if (setupLocked) {
        throw new AzFuncSystemError("Setup options can't be changed after app startup has finished.");
    }

    if (opts.enableHttpStream) {
        // NOTE: coreApi.log was coincidentally added the same time as http streaming,
        // so we can use that to validate the host version instead of messing with semver parsing
        const coreApi = tryGetCoreApiLazy();
        if (coreApi && !coreApi.log) {
            throw new AzFuncSystemError(`HTTP streaming requires Azure Functions Host v4.28 or higher.`);
        }
    }

    options = opts;
    workerSystemLog('information', `Setup options: ${JSON.stringify(options)}`);
}

export function isHttpStreamEnabled(): boolean {
    return !!options.enableHttpStream;
}
