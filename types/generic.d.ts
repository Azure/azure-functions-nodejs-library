// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, RetryOptions } from './index';

export interface GenericFunctionOptions extends FunctionOptions {
    /**
     * An optional retry policy to rerun a failed execution until either successful completion occurs or the maximum number of retries is reached.
     * Learn more [here](https://learn.microsoft.com/azure/azure-functions/functions-bindings-error-pages)
     */
    retry?: RetryOptions;
}

export interface GenericTriggerOptions extends Record<string, unknown> {
    type: string;
}

export interface GenericInputOptions extends Record<string, unknown> {
    type: string;
}

export interface GenericOutputOptions extends Record<string, unknown> {
    type: string;
}
