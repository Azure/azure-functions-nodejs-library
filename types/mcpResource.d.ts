// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

/**
 * A handler function for MCP Resource triggers.
 *
 * @param messages - The messages or data received by the trigger.
 * @param context - The invocation context for the function.
 * @returns A result that can be a promise or a synchronous value.
 */
export type McpResourceTriggerHandler<T = unknown> = (messages: T, context: InvocationContext) => FunctionResult;

/**
 * Configuration options for an MCP Resource function.
 * This includes trigger-specific options and general function options.
 */
export interface McpResourceFunctionOptions<T = unknown> extends McpResourceTriggerOptions, Partial<FunctionOptions> {
    /**
     * The handler function to execute when the trigger is invoked.
     */
    handler: McpResourceTriggerHandler<T>;

    /**
     * The trigger configuration for the MCP Resource.
     */
    trigger?: McpResourceTrigger;
}

/**
 * Configuration options for an MCP Resource trigger.
 * These options define the behavior and metadata for the trigger.
 */
export interface McpResourceTriggerOptions {
    /**
     * Unique URI identifier for the resource (must be absolute).
     * This is the canonical identifier used by MCP clients to reference the resource.
     */
    uri: string;

    /**
     * Human-readable name of the resource.
     * This name is displayed to users in MCP client interfaces.
     */
    resourceName: string;

    /**
     * Optional title for display purposes.
     * A more descriptive title that can be shown in UI elements.
     */
    title?: string;

    /**
     * Description of the resource.
     * Provides additional context about what the resource represents.
     */
    description?: string;

    /**
     * MIME type of the resource content.
     * Specifies the format of the resource data (e.g., 'application/json', 'text/plain').
     */
    mimeType?: string;

    /**
     * Optional size in bytes.
     * The expected size of the resource content, if known.
     */
    size?: number;

    /**
     * JSON-serialized metadata object.
     * Additional metadata about the resource in JSON format.
     */
    metadata?: string;
}

/**
 * Represents an MCP Resource trigger, combining base function trigger options
 * with MCP Resource-specific trigger options.
 */
export type McpResourceTrigger = FunctionTrigger & McpResourceTriggerOptions;
