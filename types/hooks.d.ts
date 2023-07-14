// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionHandler } from '.';
import { InvocationContext, LogHandler } from './InvocationContext';

/**
 * Represents a type which can release resources, such as event listening or a timer.
 */
export declare class Disposable {
    /**
     * Combine many disposable-likes into one. You can use this method when having objects with a dispose function which aren't instances of `Disposable`.
     *
     * @param disposableLikes Objects that have at least a `dispose`-function member. Note that asynchronous dispose-functions aren't awaited.
     * @return Returns a new disposable which, upon dispose, will dispose all provided disposables.
     */
    static from(...disposableLikes: { dispose: () => any }[]): Disposable;

    /**
     * Creates a new disposable that calls the provided function on dispose.
     * *Note* that an asynchronous function is not awaited.
     *
     * @param callOnDispose Function that disposes something.
     */
    constructor(callOnDispose: () => any);

    /**
     * Dispose this object.
     */
    dispose(): any;
}

/**
 * A generic handler for hooks
 */
export type HookHandler = (context: HookContext) => void | Promise<void>;

/**
 * Base class for all hook context objects
 */
export declare class HookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: HookContextInit);

    /**
     * Set a `propertyName` to some `value` to be shared with other hooks in the same scope (app-level vs invocation-level)
     * @param propertyName The name of the property to set
     * @param value The value to set
     */
    set(propertyName: string, value: unknown): void;

    /**
     * Get the value of a `propertyName` shared with other hooks in the same scope (app-level vs invocation-level)
     * @param propertyName the name of the property to get
     */
    get(propertyName: string): unknown;

    /**
     * Set a `propertyName` to some `value` to be shared across scopes for all hooks
     *
     * @param propertyName The name of the property to set
     * @param value The value to set
     */
    setGlobal(propertyName: string, value: unknown): void;

    /**
     * Get the value of a `propertyName` shared across scopes for all hooks
     * @param propertyName The name of the property to get
     */
    getGlobal(propertyName: string): unknown;
}

/**
 * Object used to pass data between hooks
 */
export type HookData = { [key: string]: any };

/**
 * Base interface for objects passed to HookContext constructors.
 * For testing purposes only.
 */
export interface HookContextInit {
    /**
     * This object will be used to persist values between hooks
     * of the same level (invocation-level vs app-level)
     *
     * Defaults to empty object if not specified
     */
    hookData?: HookData;

    /**
     * This object will be used to persist global values
     *
     * Defaults to empty object if not specified
     */
    appHookData?: HookData;
}

/**
 * Handler for app start hooks
 */
export type AppStartHandler = (context: AppStartContext) => void | Promise<void>;

/**
 * Context on a function app that is about to be started
 * This object will be passed to all app start hooks
 */
export declare class AppStartContext extends HookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: AppStartContextInit);

    /**
     * Absolute directory of the function app
     */
    functionAppDirectory: string;
}

/**
 * Object passed to AppStartContext constructors.
 * For testing purposes only
 */
export interface AppStartContextInit extends HookContextInit {
    /**
     * Defaults to 'unknown'
     */
    functionAppDirectory?: string;
}

/**
 * Handler for app terminate hooks
 */
export type AppTerminateHandler = (context: AppTerminateContext) => void | Promise<void>;

/**
 * Context on a function app that is about to be terminated
 * This object will be passed to all app terminate hooks
 */
export declare class AppTerminateContext extends HookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: AppTerminateContextInit);
}

/**
 * Object passed to AppTerminateContext constructors.
 * For testing purposes only
 */
export interface AppTerminateContextInit extends HookContextInit {}

/**
 * Options for registering a pre-invocation hook
 * This object can be passed to `onPreInvocation`
 */
export interface PreInvocationOptions {
    /**
     * The pre-invocation handler to register
     */
    handler: PreInvocationHandler;

    /**
     * Optional filter to determine which functions this handler should be invoked for.
     * If multiple filters are provided,
     * the hook is run only if satisfies _all_ of the provided filters
     */
    filter?: HookFilter | HookFilter[];
}

export type HookFilter =
    | string // The hook is run if the function name matches this string
    | HookFilterObject // The hook is run if the function invocation satisfies _any_ of the supplied criteria
    | ((context: InvocationContext) => boolean); // The hook is run if this function returns true

/**
 * An object that can be passed as a filter on invocation hooks
 * The hook is run if it satisfies _any_ of the supplied criteria in this object
 */
export interface HookFilterObject {
    /**
     * Execute hooks only on invocations of the functions with one of these names
     */
    functionNames?: string[];

    /**
     * Execute hooks only on invocations of functions with one of these trigger types
     */
    triggerTypes?: string[];

    /**
     * Execute hooks only on invocations with one of these invocation IDs
     */
    invocationIds?: string[];
}

/**
 * Handler for pre-invocation hooks
 */
export type PreInvocationHandler = (context: PreInvocationContext) => void | Promise<void>;

/**
 * Base class for all invocation hook context objects (pre-invocation and post-invocation)
 */
export declare abstract class InvocationHookContext extends HookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: InvocationHookContextInit);

    /**
     * The context object passed to the function
     * This object is readonly. You may modify it, but attempting to overwrite it will throw an error
     */
    readonly invocationContext: InvocationContext;

    /**
     * The recommended way to log data during invocation.
     * Similar to Node.js's `console.log`, but has integration with Azure features like application insights
     * Uses the 'information' log level
     */
    log(...args: any[]): void;

    /**
     * The recommended way to log trace data (level 0) during invocation.
     * Similar to Node.js's `console.trace`, but has integration with Azure features like application insights
     */
    trace(...args: any[]): void;

    /**
     * The recommended way to log debug data (level 1) during invocation.
     * Similar to Node.js's `console.debug`, but has integration with Azure features like application insights
     */
    debug(...args: any[]): void;

    /**
     * The recommended way to log information data (level 2) during invocation.
     * Similar to Node.js's `console.info`, but has integration with Azure features like application insights
     */
    info(...args: any[]): void;

    /**
     * The recommended way to log warning data (level 3) during invocation.
     * Similar to Node.js's `console.warn`, but has integration with Azure features like application insights
     */
    warn(...args: any[]): void;

    /**
     * The recommended way to log error data (level 4) during invocation.
     * Similar to Node.js's `console.error`, but has integration with Azure features like application insights
     */
    error(...args: any[]): void;
}

/**
 * Base interface passed to invocation hook context constructors.
 * For testing purposes only
 */
interface InvocationHookContextInit extends HookContextInit {
    /**
     * Defaults to new InvocationContext with default values if not specified
     */
    invocationContext?: InvocationContext;

    /**
     * Defaults to the logger on the invocation context if not specified
     */
    logHandler?: LogHandler;
}

/**
 * Context on a function that is about to be executed
 * This object will be passed to all pre-invocation hooks
 */
export declare class PreInvocationContext extends InvocationHookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: PreInvocationContextInit);

    /**
     * The arguments passed to this specific invocation.
     * Changes to this array _will_ affect the inputs passed to your function
     */
    args: any[];

    /**
     * The function handler for this specific invocation. Changes to this value _will_ affect the function itself
     */
    functionHandler: FunctionHandler;

    /**
     * Aborts the current invocation of the function.
     * Calling this method _will_ cause your function execution to not run.
     */
    abort(): void;
}

/**
 * Object passed to PreInvocationContext constructors.
 * For testing purposes only
 */
export interface PreInvocationContextInit extends InvocationHookContextInit {
    /**
     * Defaults to empty array if not specified
     */
    args?: any[];

    /**
     * Defaults to an empty function if not specified
     */
    functionHandler?: FunctionHandler;

    /**
     * This is set by the Azure Functions runtime. You should not set this yourself
     */
    coreContext?: PreInvocationCoreContext;
}

/**
 * Context for pre-invocation hooks coming from the Core API
 * This object is relevant only for hooks that are registered using the Core API
 * You should not construct this object yourself
 */
export interface PreInvocationCoreContext {
    /**
     * The input values for this specific invocation.
     * Changes to this array _will_ affect the inputs passed to your function
     */
    inputs: any[];

    /**
     * The function callback for this specific invocation.
     * Changes to this value _will_ affect the function itself
     */
    functionCallback: FunctionHandler;
}

/**
 * Options for registering a post-invocation hook
 * This object can be passed to `onPostInvocation`
 */
export interface PostInvocationOptions {
    /**
     * The pre-invocation handler to register
     */
    handler: PostInvocationHandler;

    /**
     * Optional filter to determine which functions this handler should be invoked for.
     * If multiple filters are provided,
     * the hook is run only if satisfies _all_ of the provided filters
     */
    filter?: HookFilter | HookFilter[];
}

/**
 * Handler for post-invocation hooks
 */
export type PostInvocationHandler = (context: PostInvocationContext) => void | Promise<void>;

/**
 * Context on a function that has just executed
 * This object will be passed to all post invocation hooks
 */
export declare class PostInvocationContext extends InvocationHookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: PostInvocationContextInit);

    /**
     * The arguments passed to this specific invocation.
     */
    args: any[];

    /**
     * The result of the function, or null if there is no result. Changes to this value _will_ affect the overall result of the function
     */
    result: any;

    /**
     * The error thrown by the function, or null if there is no error. Changes to this value _will_ affect the overall result of the function
     */
    errorResult: any;
}

/**
 * Object passed to PostInvocationContext constructors.
 * For testing purposes only
 */
export interface PostInvocationContextInit extends InvocationHookContextInit {
    /**
     * Defaults to empty array if not specified
     */
    args?: any[];

    /**
     * Defaults to `null` if not specified
     */
    result?: any;

    /**
     * Defaults to `null` if not specified
     */
    errorResult?: any;

    /**
     * This is set automatically by the Azure Functions runtime. You should not set this yourself
     */
    coreContext?: PostInvocationCoreContext;
}

/**
 * Context for Post Invocation hooks coming from the Core API
 * This object is relevant only for hooks that are registered using the Core API
 * You should not construct this object yourself
 */
interface PostInvocationCoreContext {
    /**
     * The input values for this specific invocation
     */
    inputs: any[];

    /**
     * The result of the function, or null if there is no result.
     * Changes to this value _will_ affect the overall result of the function
     */
    result: any;

    /**
     * The error for the function, or null if there is no error.
     * Changes to this value _will_ affect the overall result of the function
     */
    error: any;
}
