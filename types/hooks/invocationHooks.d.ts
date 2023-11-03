// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionHandler } from '../index';
import { InvocationContext } from '../InvocationContext';
import { HookContext, HookContextInit } from './HookContext';

/**
 * Handler for pre-invocation hooks.
 */
export type PreInvocationHandler = (context: PreInvocationContext) => void | Promise<void>;

/**
 * Context on a function before it executes.
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
    inputs: unknown[];

    /**
     * The function handler for this specific invocation. Changes to this value _will_ affect the function itself
     */
    functionHandler: FunctionHandler;
}

/**
 * Handler for post-invocation hooks
 */
export type PostInvocationHandler = (context: PostInvocationContext) => void | Promise<void>;

/**
 * Context on a function after it executes.
 */
export declare class PostInvocationContext extends InvocationHookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: PostInvocationContextInit);

    /**
     * The arguments passed to this specific invocation.
     */
    inputs: unknown[];

    /**
     * The result of the function. Changes to this value _will_ affect the overall result of the function
     */
    result: unknown;

    /**
     * The error thrown by the function, or null/undefined if there is no error. Changes to this value _will_ affect the overall result of the function
     */
    error: unknown;
}

/**
 * Base class for all invocation hook context objects
 */
export declare class InvocationHookContext extends HookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: InvocationHookContextInit);

    /**
     * The context object passed to the function.
     * This object is readonly. You may modify it, but attempting to overwrite it will throw an error
     */
    readonly invocationContext: InvocationContext;
}

/**
 * Object passed to InvocationHookContext constructors.
 * For testing purposes only
 */
export interface InvocationHookContextInit extends HookContextInit {
    inputs?: unknown[];

    invocationContext?: InvocationContext;
}

/**
 * Object passed to PreInvocationContext constructors.
 * For testing purposes only
 */
export interface PreInvocationContextInit extends InvocationHookContextInit {
    functionCallback?: FunctionHandler;
}

/**
 * Object passed to PostInvocationContext constructors.
 * For testing purposes only
 */
export interface PostInvocationContextInit extends InvocationHookContextInit {
    result?: unknown;

    error?: unknown;
}
