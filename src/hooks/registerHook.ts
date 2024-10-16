// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    AppStartHandler,
    AppTerminateHandler,
    LogHookHandler,
    PostInvocationHandler,
    PreInvocationHandler,
} from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import { AzFuncSystemError, ensureErrorType } from '../errors';
import { Disposable } from '../utils/Disposable';
import { tryGetCoreApiLazy } from '../utils/tryGetCoreApiLazy';
import { AppStartContext } from './AppStartContext';
import { AppTerminateContext } from './AppTerminateContext';
import { LogHookContext } from './LogHookContext';
import { PostInvocationContext } from './PostInvocationContext';
import { PreInvocationContext } from './PreInvocationContext';

function registerHook(hookName: string, callback: coreTypes.HookCallback): coreTypes.Disposable {
    const coreApi = tryGetCoreApiLazy();
    if (!coreApi) {
        console.warn(
            `WARNING: Skipping call to register ${hookName} hook because the "@azure/functions" package is in test mode.`
        );
        return new Disposable(() => {
            console.warn(
                `WARNING: Skipping call to dispose ${hookName} hook because the "@azure/functions" package is in test mode.`
            );
        });
    } else {
        return coreApi.registerHook(hookName, callback);
    }
}

export function appStart(handler: AppStartHandler): Disposable {
    return registerHook('appStart', (coreContext) => {
        return handler(new AppStartContext(coreContext));
    });
}

export function appTerminate(handler: AppTerminateHandler): Disposable {
    return registerHook('appTerminate', (coreContext) => {
        return handler(new AppTerminateContext(coreContext));
    });
}

export function preInvocation(handler: PreInvocationHandler): Disposable {
    return registerHook('preInvocation', (coreContext) => {
        return handler(new PreInvocationContext(coreContext));
    });
}

export function postInvocation(handler: PostInvocationHandler): Disposable {
    return registerHook('postInvocation', (coreContext) => {
        return handler(new PostInvocationContext(coreContext));
    });
}

export function log(handler: LogHookHandler): Disposable {
    try {
        return registerHook('log', (coreContext) => {
            return handler(new LogHookContext(coreContext));
        });
    } catch (err) {
        const error = ensureErrorType(err);
        if (error.name === 'RangeError' && error.isAzureFunctionsSystemError) {
            throw new AzFuncSystemError(`Log hooks require Azure Functions Host v4.34 or higher.`);
        } else {
            throw err;
        }
    }
}
