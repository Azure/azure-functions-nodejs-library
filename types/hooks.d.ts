// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionHandler } from '.';
import { InvocationContext } from './InvocationContext';

export type HookCallback = (context: HookContext) => void | Promise<void>;
export type PreInvocationCallback = (context: PreInvocationContext) => void | Promise<void>;
export type PostInvocationCallback = (context: PostInvocationContext) => void | Promise<void>;
export type AppStartCallback = (context: AppStartContext) => void | Promise<void>;
export type AppTerminateCallback = (context: AppTerminateContext) => void | Promise<void>;

type HookData = { [key: string]: any };

/**
 * Base interface for all hook context objects
 */
export interface HookContext {
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

/**
 * Context on a function that is about to be executed
 * This object will be passed to all pre invocation hooks
 */
export interface PreInvocationContext extends HookContext {
    /**
     * The context object passed to the function
     * This object is readonly. You may modify it, but attempting to overwrite it will throw an error
     */
    readonly invocationContext: InvocationContext;

    /**
     * The arguments passed to this specific invocation. Changes to this array _will_ affect the inputs passed to your function
     */
    args: any[];

    /**
     * The function callback for this specific invocation. Changes to this value _will_ affect the function itself
     */
    functionCallback: FunctionHandler;
}

/**
 * Context on a function that has just executed
 * This object will be passed to all post invocation hooks
 */
export interface PostInvocationContext extends HookContext {
    /**
     * The context object passed to the function
     * This object is readonly. You may modify it, but attempting to overwrite it will throw an error
     */
    readonly invocationContext: InvocationContext;

    /**
     * The arguments passed to this specific invocation
     */
    args: any[];

    /**
     * The result of the function, or null if there is no result. Changes to this value _will_ affect the overall result of the function
     */
    result: any;

    /**
     * The error for the function, or null if there is no error. Changes to this value _will_ affect the overall result of the function
     */
    error: any;
}

/**
 * Context on a function app that is about to be started
 * This object will be passed to all app start hooks
 */
export interface AppStartContext extends HookContext {
    /**
     * Absolute directory of the function app
     */
    functionAppDirectory: string;
}

export type AppTerminateContext = HookContext;

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
