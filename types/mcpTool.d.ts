// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

/**
 * A handler function for MCP Tool triggers.
 *
 * @param messages - The messages or data received by the trigger.
 * @param context - The invocation context for the function.
 * @returns A result that can be a promise or a synchronous value.
 */
export type McpToolTriggerHandler = (messages: unknown, context: InvocationContext) => FunctionResult;

/**
 * Configuration options for an MCP Tool function.
 * This includes trigger-specific options and general function options.
 */
export interface McpToolFunctionOptions extends McpToolTriggerOptions, Partial<FunctionOptions> {
    /**
     * The handler function to execute when the trigger is invoked.
     */
    handler: McpToolTriggerHandler;

    /**
     * The trigger configuration for the MCP Tool.
     */
    trigger?: McpToolTrigger;
}

/**
 * Configuration options for an MCP Tool trigger.
 * These options define the behavior and metadata for the trigger.
 */
export interface McpToolTriggerOptions {
    /**
     * The name of the tool associated with the trigger.
     * This is typically an app setting or environment variable.
     */
    toolName: string;

    /**
     * A description of the tool or trigger.
     * This provides additional context about the trigger's purpose.
     */
    description: string;

    /**
     * Additional properties or metadata for the tool.
     * Can be provided as an array or as a Args object format.
     */
    toolProperties?: McpToolProperty[] | Args;
}

/**
 * Configuration options for an MCP Tool trigger.
 * These options define the behavior and metadata for the trigger.
 */
export interface McpToolTriggerOptionsToRpc {
    /**
     * The name of the tool associated with the trigger.
     * This is typically an app setting or environment variable.
     */
    toolName: string;

    /**
     * A description of the tool or trigger.
     * This provides additional context about the trigger's purpose.
     */
    description: string;

    /**
     * Additional properties or metadata for the tool.
     * This is a dictionary of key-value pairs that can be used to configure the trigger.
     */
    toolProperties?: string;
}

/**
 * Represents an MCP Tool trigger, combining base function trigger options
 * with MCP Tool-specific trigger options.
 */
export type McpToolTrigger = FunctionTrigger & McpToolTriggerOptionsToRpc;

export interface McpToolProperty {
    /**
     * The name of the property.
     */
    propertyName: string;

    /**
     * The type of the property.
     */
    propertyType: string;

    /**
     * A description of the property.
     * This provides additional context about the purpose or usage of the property.
     */
    description?: string;

    /**
     * Indicates whether the property is required.
     */
    isRequired?: boolean;

    /**
     * Indicates whether the property is an array type.
     */
    isArray?: boolean;
}

/**
 * Represents a tool property definition (same as McpToolProperty but without propertyName)
 */
export type Arg = Omit<McpToolProperty, 'propertyName'>;

/**
 * Tool properties format - an object mapping property names to their definitions
 */
export type Args = Record<string, Arg>;
