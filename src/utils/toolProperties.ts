// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { Args, McpToolProperty } from '../../types/mcpTool';

/**
 * Fluent API builder for creating MCP Tool properties
 * Also implements McpToolProperty interface to work seamlessly in object contexts
 */
export class ToolPropertyBuilder implements McpToolProperty {
    private property: Partial<McpToolProperty> = {};

    // Implement McpToolProperty interface with getters
    get propertyName(): string {
        return this.property.propertyName || '';
    }

    get propertyType(): string {
        if (!this.property.propertyType) {
            throw new Error('Property type must be specified (use .string(), .number(), etc.)');
        }
        return this.property.propertyType;
    }

    get description(): string {
        return this.property.description || '';
    }

    get isRequired(): boolean {
        return this.property.isRequired ?? true; // Default to true (required by default)
    }

    get isArray(): boolean {
        return this.property.isArray ?? false;
    }

    /**
     * Set the property type to string
     */
    string(): ToolPropertyBuilder {
        this.property.propertyType = 'string';
        return this;
    }

    /**
     * Set the property type to double
     */
    double(): ToolPropertyBuilder {
        this.property.propertyType = 'number';
        return this;
    }

    /**
     * Set the property type to long
     */
    long(): ToolPropertyBuilder {
        this.property.propertyType = 'number';
        return this;
    }

    /**
     * Set the property type to number
     */
    number(): ToolPropertyBuilder {
        this.property.propertyType = 'number';
        return this;
    }

    /**
     * Set the property type to boolean
     */
    boolean(): ToolPropertyBuilder {
        this.property.propertyType = 'boolean';
        return this;
    }

    /**
     * Set the property type to object
     */
    object(): ToolPropertyBuilder {
        this.property.propertyType = 'object';
        return this;
    }

    /**
     * Set the property type to long
     */
    integer(): ToolPropertyBuilder {
        this.property.propertyType = 'integer';
        return this;
    }

    /**
     * Set the property type to long
     */
    datetime(): ToolPropertyBuilder {
        this.property.propertyType = 'string';
        return this;
    }

    /**
     * Set the description for the property
     * @param description - Description of the property's purpose
     */
    describe(description: string): ToolPropertyBuilder {
        this.property.description = description;
        return this;
    }

    /**
     * Mark the property as optional
     */
    optional(): McpToolProperty {
        this.property.isRequired = false;
        return this.buildInternal();
    }

    /**
     * Mark the property as an array type
     */
    asArray(): ToolPropertyBuilder {
        this.property.isArray = true;
        return this;
    }

    /**
     * Build the final McpToolProperty object
     * @private
     */
    private buildInternal(): McpToolProperty {
        if (!this.property.propertyType) {
            throw new Error('Property type must be specified (use .string(), .number(), etc.)');
        }

        return {
            propertyName: '', // Will be set by the consumer based on the key
            propertyType: this.property.propertyType,
            description: this.property.description || '', // Default to empty string if not provided
            isRequired: this.property.isRequired ?? true, // Default to true (required by default)
            isArray: this.property.isArray ?? false,
        };
    }
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
export const arg = {
    /**
     * Start building a string property
     */
    string(): ToolPropertyBuilder {
        return new ToolPropertyBuilder().string();
    },

    /**
     * Start building a number property
     */
    integer(): ToolPropertyBuilder {
        return new ToolPropertyBuilder().integer();
    },

    /**
     * Start building a number property
     */
    number(): ToolPropertyBuilder {
        return new ToolPropertyBuilder().number();
    },

    /**
     * Start building a long property
     */
    long(): ToolPropertyBuilder {
        return new ToolPropertyBuilder().long();
    },

    /**
     * Start building a double property
     */
    double(): ToolPropertyBuilder {
        return new ToolPropertyBuilder().double();
    },

    /**
     * Start building a boolean property
     */
    boolean(): ToolPropertyBuilder {
        return new ToolPropertyBuilder().boolean();
    },

    /**
     * Start building a datetime property
     */
    datetime(): ToolPropertyBuilder {
        return new ToolPropertyBuilder().datetime();
    },

    /**
     * Start building an object property
     */
    object(): ToolPropertyBuilder {
        return new ToolPropertyBuilder().object();
    },
};

/**
 * Convert a tool properties object to McpToolProperty array
 * @param toolProps - Object with property names as keys and ToolProperty as values
 * @returns Array of McpToolProperty objects with propertyName set correctly
 */
export function convertToolProperties(args: Args): McpToolProperty[] {
    return Object.entries(args).map(([propertyName, property]) => ({
        propertyName,
        propertyType: property.propertyType,
        description: property.description || '', // Default to empty string if not provided
        isRequired: property.isRequired,
        isArray: property.isArray,
    }));
}

/**
 * Type guard to check if properties are in toolProp format
 */
export function isToolProperties(properties: unknown): properties is Args {
    return (
        typeof properties === 'object' &&
        properties !== null &&
        !Array.isArray(properties) &&
        Object.values(properties as Record<string, unknown>).every(
            (prop) =>
                typeof prop === 'object' &&
                prop !== null &&
                'propertyType' in prop &&
                'description' in prop &&
                'isRequired' in prop &&
                'isArray' in prop
        )
    );
}

/**
 * Validate that a tool property has required fields
 */
function validateToolProperty(property: McpToolProperty, propertyName?: string): void {
    const nameContext = propertyName ? ` for property '${propertyName}'` : '';

    if (!property.propertyType || property.propertyType.trim() === '') {
        throw new Error(`Property type is required${nameContext}`);
    }

    // Ensure description defaults to empty string if not provided
    if (property.description === undefined || property.description === null) {
        property.description = '';
    }
}

/**
 * Normalize tool properties to McpToolProperty array format
 * Supports both legacy array format and new toolProp object format
 */
export function normalizeToolProperties(
    properties: McpToolProperty[] | Args | undefined
): McpToolProperty[] | undefined {
    if (!properties) {
        return undefined;
    }

    if (Array.isArray(properties)) {
        // Validate each property in the array
        properties.forEach((property, index) => {
            validateToolProperty(property, property.propertyName || `index ${index}`);
        });
        return properties;
    }

    if (isToolProperties(properties)) {
        const converted = convertToolProperties(properties);
        return converted;
    }

    // Unknown format
    throw new Error('Invalid tool properties format');
}
