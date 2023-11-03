// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { HookContext, HookContextInit } from './HookContext';

/**
 * Handler for app start hooks
 */
export type AppStartHandler = (context: AppStartContext) => void | Promise<void>;

/**
 * Context on a function app during app startup.
 */
export declare class AppStartContext extends HookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: AppStartContextInit);
}

/**
 * Handler for app terminate hooks
 */
export type AppTerminateHandler = (context: AppTerminateContext) => void | Promise<void>;

/**
 * Context on a function app during app termination.
 */
export declare class AppTerminateContext extends HookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: AppTerminateContextInit);
}

/**
 * Object passed to AppStartContext constructors.
 * For testing purposes only
 */
export interface AppStartContextInit extends HookContextInit {}

/**
 * Object passed to AppTerminateContext constructors.
 * For testing purposes only
 */
export interface AppTerminateContextInit extends HookContextInit {}
