// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';

export function fallbackLogHandler(level: types.LogLevel, ...args: unknown[]): void {
    switch (level) {
        case 'trace':
            console.trace(...args);
            break;
        case 'debug':
            console.debug(...args);
            break;
        case 'information':
            console.info(...args);
            break;
        case 'warning':
            console.warn(...args);
            break;
        case 'critical':
        case 'error':
            console.error(...args);
            break;
        default:
            console.log(...args);
    }
}
