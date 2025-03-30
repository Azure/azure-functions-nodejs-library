// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type McpToolTriggerHandler = (messages: unknown, context: InvocationContext) => FunctionResult;

export interface McpToolFunctionOptions extends McpToolTriggerOptions, Partial<FunctionOptions> {
    handler: McpToolTriggerHandler;

    trigger?: McpToolTrigger;
}

export interface McpToolTriggerOptions {
    /**
     * An app setting (or environment variable) with the service bus connection string
     */
    toolName: string;

    /**
     * An app setting (or environment variable) with the service bus connection string
     */
    description: string;

    /**
     * A dictionary of arguments associated with the trigger.
     */
    toolProperties?: Record<string, unknown>;
}
export type McpToolTrigger = FunctionTrigger & McpToolTriggerOptions;
