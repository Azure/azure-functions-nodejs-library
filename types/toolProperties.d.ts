// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { McpToolProperty } from './mcpTool';

/**
 * Fluent API builder for creating MCP Tool properties
 * Also implements McpToolProperty interface to work seamlessly in object contexts
 */
export declare class ToolPropertyBuilder implements McpToolProperty {
    // Implement McpToolProperty interface with getters
    get propertyName(): string;
    get propertyType(): string;
    get description(): string;
    get isRequired(): boolean;
    get isArray(): boolean;

    /**
     * Set the property type to string
     */
    string(): ToolPropertyBuilder;

    /**
     * Set the property type to double
     */
    double(): ToolPropertyBuilder;

    /**
     * Set the property type to long
     */
    long(): ToolPropertyBuilder;

    /**
     * Set the property type to number
     */
    number(): ToolPropertyBuilder;

    /**
     * Set the property type to boolean
     */
    boolean(): ToolPropertyBuilder;

    /**
     * Set the property type to object
     */
    object(): ToolPropertyBuilder;

    /**
     * Set the property type to integer
     */
    integer(): ToolPropertyBuilder;

    /**
     * Set the property type to datetime
     */
    datetime(): ToolPropertyBuilder;

    /**
     * Set the description for the property
     * @param description - Description of the property's purpose
     */
    describe(description: string): ToolPropertyBuilder;

    /**
     * Mark the property as optional
     */
    optional(): McpToolProperty;

    /**
     * Mark the property as an array type
     */
    asArray(): ToolPropertyBuilder;
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
    /**
     * Start building a string property
     */
    string(): ToolPropertyBuilder;

    /**
     * Start building a number property
     */
    integer(): ToolPropertyBuilder;

    /**
     * Start building a number property
     */
    number(): ToolPropertyBuilder;

    /**
     * Start building a long property
     */
    long(): ToolPropertyBuilder;

    /**
     * Start building a double property
     */
    double(): ToolPropertyBuilder;

    /**
     * Start building a boolean property
     */
    boolean(): ToolPropertyBuilder;

    /**
     * Start building a datetime property
     */
    datetime(): ToolPropertyBuilder;

    /**
     * Start building an object property
     */
    object(): ToolPropertyBuilder;
};
