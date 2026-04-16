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
export type McpToolTriggerHandler<T = unknown> = (messages: T, context: InvocationContext) => FunctionResult;

/**
 * Configuration options for an MCP Tool function.
 * This includes trigger-specific options and general function options.
 */
export interface McpToolFunctionOptions<T = unknown> extends McpToolTriggerOptions, Partial<FunctionOptions> {
    /**
     * The handler function to execute when the trigger is invoked.
     */
    handler: McpToolTriggerHandler<T>;

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

    /**
     * JSON-serialized metadata object.
     * Additional metadata about the tool in JSON format.
     */
    metadata?: string;

    /**
     * Optional JSON-serialized JSON Schema describing the structured result of this tool.
     *
     * When provided, the value is validated as JSON and sent alongside `useResultSchema: true`
     * so MCP clients that support structured content can use the declared schema.
     */
    resultSchema?: string;
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
     * Always enabled so the host contract advertises structured-result support.
     */
    useResultSchema: boolean;

    /**
     * Additional properties or metadata for the tool.
     * This is a dictionary of key-value pairs that can be used to configure the trigger.
     */
    toolProperties?: string;

    /**
     * JSON-serialized metadata object.
     * Additional metadata about the tool in JSON format.
     */
    metadata?: string;

    /**
     * Optional JSON-serialized JSON Schema describing the structured result of this tool.
     */
    resultSchema?: string;
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

/**
 * A text content block in an MCP tool response.
 * Equivalent to .NET's TextContentBlock.
 */
export interface TextContentBlock {
    type: 'text';
    text: string;
}

/**
 * An image content block in an MCP tool response.
 * Equivalent to .NET's ImageContentBlock.
 * `data` must be base64-encoded. The library automatically encodes Buffer/ArrayBuffer values.
 */
export interface ImageContentBlock {
    type: 'image';
    data: string | Buffer | ArrayBuffer;
    mimeType?: string;
}

/**
 * An audio content block in an MCP tool response.
 */
export interface AudioContentBlock {
    type: 'audio';
    data: string | Buffer | ArrayBuffer;
    mimeType?: string;
}

/**
 * A resource-link content block in an MCP tool response.
 */
export interface ResourceLinkContentBlock {
    type: 'resource_link';
    uri: string;
    name?: string;
    description?: string;
    mimeType?: string;
}

/**
 * Union of all known content block types for an MCP tool response.
 * Equivalent to .NET's ContentBlock base class.
 */
export type McpContentBlock =
    | TextContentBlock
    | ImageContentBlock
    | AudioContentBlock
    | ResourceLinkContentBlock
    | Record<string, unknown>;

/**
 * Full call-tool result with explicit content blocks and optional structured content.
 * Use this when you need manual control over both content and structuredContent.
 * Equivalent to constructing a CallToolResult in .NET with explicit blocks.
 *
 * ```typescript
 * return {
 *   content: [
 *     { type: 'text', text: 'Here is the image' },
 *     { type: 'image', data: base64Data, mimeType: 'image/png' }
 *   ],
 *   structuredContent: { imageId: 'logo', format: 'png' }
 * };
 * ```
 */
export interface CallToolResult {
    content: McpContentBlock[];
    structuredContent?: unknown;
    isError?: boolean;
}

/**
 * Internal wire payload emitted by the library after converting a tool's return value.
 * Customers do not construct this directly — return one of the above types instead.
 * @internal
 */
export interface McpToolResult {
    type: string;
    content?: string;
    structuredContent?: string;
}
