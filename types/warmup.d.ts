// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export interface WarmupContext {}
export type WarmupHandler = (warmupContext: WarmupContext, context: InvocationContext) => FunctionResult;

export interface WarmupFunctionOptions extends WarmupTriggerOptions, Partial<FunctionOptions> {
    handler: WarmupHandler;

    trigger?: WarmupTrigger;
}

export interface WarmupTriggerOptions {}
export type WarmupTrigger = FunctionTrigger & WarmupTriggerOptions;
