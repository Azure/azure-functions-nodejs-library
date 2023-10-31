// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export interface WarmupContextOptions {}
export type WarmupHandler = (warmupContext: WarmupContextOptions, context: InvocationContext) => FunctionResult;

export interface WarmupFunctionOptions extends WarmupTriggerOptions, Partial<FunctionOptions> {
    handler: WarmupHandler;

    trigger?: WarmupTrigger;
}

export interface WarmupTriggerOptions {}
export type WarmupTrigger = FunctionTrigger & WarmupTriggerOptions;
