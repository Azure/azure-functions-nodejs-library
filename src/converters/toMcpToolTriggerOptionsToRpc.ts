// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { McpToolProperty, McpToolTriggerOptions, McpToolTriggerOptionsToRpc } from '../../types';

// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

/**
 * Converts an McpToolTriggerOptions object to an McpToolTriggerOptionsToRpc object.
 *
 * @param mcpToolTriggerOptions - The input options to be converted.
 * @returns The converted McpToolTriggerOptionsToRpc object.
 */
export function converToMcpToolTriggerOptionsToRpc(
    mcpToolTriggerOptions: McpToolTriggerOptions
): McpToolTriggerOptionsToRpc {
    //Check for null or undefined input
    if (!mcpToolTriggerOptions?.toolProperties) {
        return {
            toolName: mcpToolTriggerOptions.toolName,
            description: mcpToolTriggerOptions.description,
            toolProperties: JSON.stringify([]), // Default to an empty array
        };
    }

    //Check if toolProperties is an array of McpToolProperty objects
    if (Array.isArray(mcpToolTriggerOptions.toolProperties)) {
        const isValid = mcpToolTriggerOptions.toolProperties.every(isMcpToolProperty);
        if (isValid) {
            return {
                toolName: mcpToolTriggerOptions.toolName,
                description: mcpToolTriggerOptions.description,
                toolProperties: JSON.stringify(mcpToolTriggerOptions.toolProperties),
            };
        }
    }
    // Handle cases where toolProperties is a zod schema or other object types
    else if (
        mcpToolTriggerOptions?.toolProperties !== null &&
        typeof mcpToolTriggerOptions.toolProperties === 'object'
    ) {
        return {
            toolName: mcpToolTriggerOptions.toolName,
            description: mcpToolTriggerOptions.description,
            toolProperties: JSON.stringify(
                Object.entries(mcpToolTriggerOptions?.toolProperties as Record<string, unknown>).map(
                    ([key, value]) => ({
                        propertyName: key,
                        propertyType: getPropertyType(value),
                        description: (value as { _def: { description: string } })._def.description,
                    })
                )
            ),
        };
    }
    // Handle cases where toolProperties is not an array
    throw new Error('Invalid toolProperties: Expected an array of McpToolProperty objects or zod objects.');
}

// Helper function to infer property type from zod schema
function getPropertyType(zodType: any): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    switch (zodType._def.typeName) {
        case 'ZodNumber':
            return 'number';
        case 'ZodString':
            return 'string';
        case 'ZodBoolean':
            return 'boolean';
        case 'ZodArray':
            return 'array';
        case 'ZodObject':
            return 'object';
        default:
            return 'unknown';
    }
}

/**
 * Type guard to check if a given object is of type McpToolProperty.
 *
 * @param property - The object to check.
 * @returns True if the object is of type McpToolProperty, otherwise false.
 *
 * This function ensures that the object:
 * - Is not null and is of type 'object'.
 * - Contains the required properties: 'propertyName', 'propertyValue', and 'description'.
 * - Each of these properties is of the correct type (string).
 */
function isMcpToolProperty(property: unknown): property is McpToolProperty {
    return (
        typeof property === 'object' &&
        property !== null &&
        'propertyName' in property &&
        'propertyValue' in property &&
        'description' in property &&
        typeof (property as McpToolProperty).propertyName === 'string' &&
        typeof (property as McpToolProperty).propertyValue === 'string' &&
        typeof (property as McpToolProperty).description === 'string'
    );
}
