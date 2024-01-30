// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { SetupOptions } from '../types';
import { AzFuncSystemError } from './errors';
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
    options = opts;
    workerSystemLog('information', `Setup options: ${JSON.stringify(options)}`);
}

export function isHttpStreamEnabled(): boolean {
    return !!options.enableHttpStream;
}
