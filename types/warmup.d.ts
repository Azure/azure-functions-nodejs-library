// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger, RetryOptions } from './index';
import { InvocationContext } from './InvocationContext';

export type WarmupHandler = (warmupContext: object, context: InvocationContext) => FunctionResult;

export interface WarmupFunctionOptions extends WarmupTriggerOptions, Partial<FunctionOptions> {
    handler: WarmupHandler;

    trigger?: WarmupTrigger;

    /**
     * An optional retry policy to rerun a failed execution until either successful completion occurs or the maximum number of retries is reached.
     * Learn more [here](https://learn.microsoft.com/azure/azure-functions/functions-bindings-error-pages)
     */
    retry?: RetryOptions;
}

export interface WarmupTriggerOptions {}

export type WarmupTrigger = FunctionTrigger & WarmupTriggerOptions;
