// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { Args, McpToolProperty } from './mcpTool';
import type { IToolPropertyBuilder } from './toolPropertyBuilder';

/**
 * Fluent API builder for creating MCP Tool properties
 * Implements IToolPropertyBuilder interface to ensure consistency
 */
export declare class ToolPropertyBuilder implements IToolPropertyBuilder {
    get propertyType(): string;
    get description(): string;
    get isRequired(): boolean;
    get isArray(): boolean;

    string(): IToolPropertyBuilder;
    double(): IToolPropertyBuilder;
    long(): IToolPropertyBuilder;
    number(): IToolPropertyBuilder;
    boolean(): IToolPropertyBuilder;
    object(): IToolPropertyBuilder;
    integer(): IToolPropertyBuilder;
    datetime(): IToolPropertyBuilder;
    describe(description: string): IToolPropertyBuilder;
    optional(): IToolPropertyBuilder;
    asArray(): IToolPropertyBuilder;
}

/**
 * Factory function to create a new tool property builder
 *
 * @example
 * ```typescript
 * const toolProperties = {
 *   snippetName: arg
 *     .string()
 *     .describe("Some Description"),
 *
 *   optionalField: arg
 *     .number()
 *     .describe("Optional number field")
 *     .optional(),
 * };
 * ```
 */
export declare const arg: {
    string(): IToolPropertyBuilder;
    integer(): IToolPropertyBuilder;
    number(): IToolPropertyBuilder;
    long(): IToolPropertyBuilder;
    double(): IToolPropertyBuilder;
    boolean(): IToolPropertyBuilder;
    datetime(): IToolPropertyBuilder;
    object(): IToolPropertyBuilder;
};

/**
 * Convert a tool properties object to McpToolProperty array
 * @param args - Object with property names as keys and ToolProperty as values
 * @returns Array of McpToolProperty objects with propertyName set correctly
 */
export declare function convertToolProperties(args: Args): McpToolProperty[];

/**
 * Type guard to check if properties are in toolProp format
 */
export declare function isToolProperties(properties: unknown): properties is Args;

/**
 * Normalize tool properties to McpToolProperty array format
 * Supports both legacy array format and new toolProp object format
 */
export declare function normalizeToolProperties(
    properties: McpToolProperty[] | Args | undefined
): McpToolProperty[] | undefined;
