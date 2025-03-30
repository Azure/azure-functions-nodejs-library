// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type McpServerTriggerHandler = (messages: unknown, context: InvocationContext) => FunctionResult;

export interface McpServerFunctionOptions extends McpServerTriggerOptions, Partial<FunctionOptions> {
    handler: McpServerTriggerHandler;

    trigger?: McpServerTrigger;
}

export interface McpServerTriggerOptions {
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
export type McpServerTrigger = FunctionTrigger & McpServerTriggerOptions;
