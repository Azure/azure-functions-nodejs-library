// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { InvocationContext, LogHandler, LogLevel } from '@azure/functions';

export function fallbackLogHandler(level: LogLevel, ...args: unknown[]): void {
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

export function logHandlerFromContext(invocationContext: InvocationContext): LogHandler {
    return (level: LogLevel, ...args: unknown[]): void => {
        switch (level) {
            case 'information':
                return invocationContext.log(...args);
            case 'trace':
                return invocationContext.trace(...args);
            case 'debug':
                return invocationContext.debug(...args);
            case 'warning':
                return invocationContext.warn(...args);
            case 'critical':
            case 'error':
                return invocationContext.error(...args);
            default:
                return invocationContext.log(...args);
        }
    };
}
