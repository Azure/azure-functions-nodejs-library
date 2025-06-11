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
    // Base object for the return value
    const baseResult = {
        toolName: mcpToolTriggerOptions.toolName,
        description: mcpToolTriggerOptions.description,
    };

    // Check for null or undefined toolProperties
    if (!mcpToolTriggerOptions?.toolProperties) {
        return {
            ...baseResult,
            toolProperties: JSON.stringify([]), // Default to an empty array
        };
    }

    // Check if toolProperties is an array of McpToolProperty objects
    if (Array.isArray(mcpToolTriggerOptions.toolProperties)) {
        const isValid = mcpToolTriggerOptions.toolProperties.every(isMcpToolProperty);
        if (isValid) {
            return {
                ...baseResult,
                toolProperties: JSON.stringify(mcpToolTriggerOptions.toolProperties),
            };
        } else {
            throw new Error(
                'Invalid toolProperties: Array contains invalid McpToolProperty, please validate the parameters.'
            );
        }
    }

    // Handle cases where toolProperties is an object (e.g., Zod schema)
    if (typeof mcpToolTriggerOptions.toolProperties === 'object') {
        // Define the type of the ZodObject shape and ZodPropertyDef
        type ZodPropertyDef = {
            description?: string;
            typeName: string;
        };
        type ZodObjectShape = Record<string, { _def: ZodPropertyDef }>;

        // Define the type of the toolProperties object
        type ToolProperties =
            | {
                  _def?: {
                      typeName?: string;
                  };
                  shape?: ZodObjectShape;
              }
            | Record<string, unknown>;

        let isZodObject = false;

        const toolProperties = mcpToolTriggerOptions.toolProperties as ToolProperties;

        // Check if the object is a ZodObject
        if ((toolProperties?._def as { typeName?: string })?.typeName === 'ZodObject') {
            isZodObject = true;
        }

        // Check if shape is a valid ZodObject shape
        const shape: ZodObjectShape | Record<string, unknown> = isZodObject
            ? (toolProperties as { shape: ZodObjectShape }).shape
            : toolProperties;

        // Extract properties from the ZodObject shape
        const result = Object.keys(shape).map((propertyName) => {
            const property = shape[propertyName] as { _def: ZodPropertyDef };
            const description = property?._def?.description || '';
            const propertyType = getPropertyType(property?._def?.typeName?.toLowerCase() || 'unknown'); // Extract type name or default to "unknown"

            return {
                propertyName,
                propertyType,
                description,
            };
        });

        return {
            ...baseResult,
            toolProperties: JSON.stringify(result),
        };
    }
    // Handle cases where toolProperties is not an array
    throw new Error('Invalid toolProperties: Expected an array of McpToolProperty objects or zod objects.');
}

// Helper function to infer property type from zod schema
function getPropertyType(zodType: string): string {
    switch (zodType) {
        case 'zodnumber':
            return 'number';
        case 'zodstring':
            return 'string';
        case 'zodboolean':
            return 'boolean';
        case 'zodarray':
            return 'array';
        case 'zodobject':
            return 'object';
        case 'zodbigint':
            return 'long';
        case 'zoddate':
            return 'DateTime';
        case 'zodtuple':
            return 'Tuple';
        default:
            console.warn(`Unknown zod type: ${zodType}`);
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
        'propertyType' in property &&
        'description' in property &&
        typeof (property as McpToolProperty).propertyName === 'string' &&
        typeof (property as McpToolProperty).propertyType === 'string' &&
        typeof (property as McpToolProperty).description === 'string'
    );
}
