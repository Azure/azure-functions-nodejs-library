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
 * Abstract base class for MCP tool response content blocks.
 *
 * The Azure Functions library discriminates content blocks from plain user values using
 * `instanceof McpContentBlock`, so only instances of the built-in subclasses
 * (`TextContent`, `ImageContent`, `AudioContent`, `ResourceLinkContent`, `ResourceContent`)
 * — or a custom subclass that extends this class — will be treated as content blocks.
 *
 * Plain object literals like `{ type: 'text', text: '...' }` are **not** treated as
 * content blocks and will be serialized as JSON text instead.
 */
export declare abstract class McpContentBlock {
    abstract readonly type: string;
    abstract toJSON(): Record<string, unknown>;
}

/** A text content block in an MCP tool response. */
export declare class TextContent extends McpContentBlock {
    readonly type: 'text';
    readonly text: string;
    constructor(text: string);
    toJSON(): Record<string, unknown>;
}

/** Initializer for `ImageContent`. `data` is base64-encoded automatically for Buffer/ArrayBuffer values. */
export interface ImageContentInit {
    data: string | Buffer | ArrayBuffer;
    mimeType?: string;
}

/** An image content block in an MCP tool response. */
export declare class ImageContent extends McpContentBlock {
    readonly type: 'image';
    readonly data: string | Buffer | ArrayBuffer;
    readonly mimeType?: string;
    constructor(init: ImageContentInit);
    toJSON(): Record<string, unknown>;
}

/** Initializer for `AudioContent`. `data` is base64-encoded automatically for Buffer/ArrayBuffer values. */
export interface AudioContentInit {
    data: string | Buffer | ArrayBuffer;
    mimeType?: string;
}

/** An audio content block in an MCP tool response. */
export declare class AudioContent extends McpContentBlock {
    readonly type: 'audio';
    readonly data: string | Buffer | ArrayBuffer;
    readonly mimeType?: string;
    constructor(init: AudioContentInit);
    toJSON(): Record<string, unknown>;
}

/** Initializer for `ResourceLinkContent`. */
export interface ResourceLinkContentInit {
    uri: string;
    name?: string;
    description?: string;
    mimeType?: string;
}

/** A resource-link content block in an MCP tool response. */
export declare class ResourceLinkContent extends McpContentBlock {
    readonly type: 'resource_link';
    readonly uri: string;
    readonly name?: string;
    readonly description?: string;
    readonly mimeType?: string;
    constructor(init: ResourceLinkContentInit);
    toJSON(): Record<string, unknown>;
}

/** Initializer for `ResourceContent`. `blob` is base64-encoded automatically for Buffer/ArrayBuffer values. */
export interface ResourceContentInit {
    resource: {
        uri: string;
        mimeType?: string;
        text?: string;
        blob?: string | Buffer | ArrayBuffer;
    };
}

/** An embedded-resource content block in an MCP tool response. */
export declare class ResourceContent extends McpContentBlock {
    readonly type: 'resource';
    readonly resource: ResourceContentInit['resource'];
    constructor(init: ResourceContentInit);
    toJSON(): Record<string, unknown>;
}

/** Initializer for `McpToolResponse`. */
export interface McpToolResponseInit {
    content: McpContentBlock[];
    structuredContent?: unknown;
    isError?: boolean;
}

/**
 * Full MCP tool response with explicit content blocks and optional structured content.
 * Return an instance of this class from a tool handler when you need full control over
 * both the content array and `structuredContent`.
 *
 * ```typescript
 * return new McpToolResponse({
 *   content: [
 *     new TextContent('Here is the image'),
 *     new ImageContent({ data: base64Data, mimeType: 'image/png' })
 *   ],
 *   structuredContent: { imageId: 'logo', format: 'png' }
 * });
 * ```
 */
export declare class McpToolResponse {
    readonly content: McpContentBlock[];
    readonly structuredContent?: unknown;
    readonly isError?: boolean;
    constructor(init: McpToolResponseInit);
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
