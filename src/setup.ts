// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { SetupOptions } from '../types';
import { AzFuncSystemError } from './errors';
import { isDefined } from './utils/nonNull';
import { tryGetCoreApiLazy } from './utils/tryGetCoreApiLazy';
import { workerSystemLog } from './utils/workerSystemLog';

let setupLocked = false;
export function lockSetup(): void {
    setupLocked = true;
}

export let enableHttpStream = false;
export const capabilities: Record<string, string> = {};

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

    if (isDefined(opts.enableHttpStream)) {
        enableHttpStream = opts.enableHttpStream;
    }

    if (opts.capabilities) {
        for (let [key, val] of Object.entries(opts.capabilities)) {
            if (isDefined(val)) {
                val = String(val);
                workerSystemLog('debug', `Capability ${key} set to ${val}.`);
                capabilities[key] = val;
            }
        }
    }

    if (enableHttpStream) {
        workerSystemLog('debug', `HTTP streaming enabled.`);
    }
}
