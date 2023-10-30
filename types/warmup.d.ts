// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type WarmupHandler = (warmupContext: object, context: InvocationContext) => FunctionResult;

export interface WarmupFunctionOptions extends WarmupTriggerOptions, Partial<FunctionOptions> {
    handler: WarmupHandler;
}

export interface WarmupTriggerOptions {}

export type WarmupTrigger = FunctionTrigger & WarmupTriggerOptions;
