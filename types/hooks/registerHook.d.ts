// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Disposable } from '../index';
import { AppStartHandler, AppTerminateHandler } from './appHooks';
import { PostInvocationHandler, PreInvocationHandler } from './invocationHooks';

/**
 * Register a hook to be run at the start of your application
 *
 * @param handler the handler for the hook
 * @returns a `Disposable` object that can be used to unregister the hook
 */
export function appStart(handler: AppStartHandler): Disposable;

/**
 * Register a hook to be run during graceful shutdown of your application.
 * This hook will not be executed if your application is terminated forcefully.
 * Hooks have a limited time to execute during the termination grace period.
 *
 * @param handler the handler for the hook
 * @returns a `Disposable` object that can be used to unregister the hook
 */
export function appTerminate(handler: AppTerminateHandler): Disposable;

/**
 * Register a hook to be run before a function is invoked.
 *
 * @param handler the handler for the hook
 * @returns a `Disposable` object that can be used to unregister the hook
 */
export function preInvocation(handler: PreInvocationHandler): Disposable;

/**
 * Register a hook to be run after a function is invoked.
 *
 * @param handler the handler for the hook
 * @returns a `Disposable` object that can be used to unregister the hook
 */
export function postInvocation(handler: PostInvocationHandler): Disposable;
