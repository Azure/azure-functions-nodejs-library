// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

/**
 * Base class for all hook context objects
 */
export declare class HookContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: HookContextInit);

    /**
     * The recommended place to store and share data between hooks in the same scope (app-level vs invocation-level).
     * You should use a unique property name so that it doesn't conflict with other hooks' data.
     * This object is readonly. You may modify it, but attempting to overwrite it will throw an error
     */
    readonly hookData: Record<string, unknown>;
}

/**
 * Base interface for objects passed to HookContext constructors.
 * For testing purposes only.
 */
export interface HookContextInit {
    hookData?: Record<string, unknown>;
}
