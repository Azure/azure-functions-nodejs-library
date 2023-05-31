// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionHandler } from '.';
import { InvocationContext, LogHandler } from './InvocationContext';

export type HookCallback = (context: HookContext) => void | Promise<void>;
export type PreInvocationCallback = (context: PreInvocationContext) => void | Promise<void>;
export type PostInvocationCallback = (context: PostInvocationContext) => void | Promise<void>;
export type AppStartCallback = (context: AppStartContext) => void | Promise<void>;
export type AppTerminateCallback = (context: AppTerminateContext) => void | Promise<void>;

type HookData = { [key: string]: any };

/**
 * Base class for all hook context objects
 */
export declare abstract class HookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: HookContextInit);

    /**
     * The recommended place to share data between hooks in the same scope (app-level vs invocation-level)
     * This object is readonly. You may modify it, but attempting to overwrite it will throw an error
     */
    readonly hookData: HookData;
    /**
     * The recommended place to share data across scopes for all hooks
     * This object is readonly. You may modify it, but attempting to overwrite it will throw an error
     */
    readonly appHookData: HookData;
}

export interface HookContextInit {
    /**
     * Defaults to empty object if not specified
     */
    hookData?: HookData;

    /**
     * Defaults to empty object if not specified
     */
    appHookData?: HookData;
}

/**
 * Base class for all invocation hook context objects
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
     * The arguments passed to this specific invocation.
     * In pre-invocation hooks, changes to this array _will_ affect the inputs passed to your function
     */
    args: any[];

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

interface InvocationHookContextInit extends HookContextInit {
    /**
     * Defaults to new InvocationContext with default values if not specified
     */
    invocationContext?: InvocationContext;

    /**
     * Defaults to empty array if not specified
     */
    args?: any[];

    /**
     * Defaults to logger on the invocation context if not specified
     */
    logHandler?: LogHandler;
}

/**
 * Context on a function that is about to be executed
 * This object will be passed to all pre invocation hooks
 */
export declare class PreInvocationContext extends InvocationHookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: PreInvocationContextInit);

    /**
     * The function callback for this specific invocation. Changes to this value _will_ affect the function itself
     */
    functionCallback: FunctionHandler;
}

export interface PreInvocationContextInit extends InvocationHookContextInit {
    /**
     * Defaults to an empty function if not specified
     */
    functionCallback?: FunctionHandler;
}

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
     * The result of the function, or null if there is no result. Changes to this value _will_ affect the overall result of the function
     */
    result: any;

    /**
     * The error thrown by the function, or null if there is no error. Changes to this value _will_ affect the overall result of the function
     */
    errorResult: any;
}

export interface PostInvocationContextInit extends InvocationHookContextInit {
    /**
     * Defaults to `null` if not specified
     */
    result?: any;

    /**
     * Defaults to `null` if not specified
     */
    errorResult?: any;
}

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

export interface AppStartContextInit extends HookContextInit {
    /**
     * Defaults to 'unknown'
     */
    functionAppDirectory?: string;
}

export declare class AppTerminateContext extends HookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: AppTerminateContextInit);
}

export interface AppTerminateContextInit extends HookContextInit {}

/**
 * Represents a type which can release resources, such as event listening or a timer.
 */
export class Disposable {
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
