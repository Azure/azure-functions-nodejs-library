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
            throw new Error('Invalid toolProperties: Array contains invalid McpToolProperty objects.');
        }
    }

    // Handle cases where toolProperties is an object (e.g., Zod schema)
    if (typeof mcpToolTriggerOptions.toolProperties === 'object') {
        let isZodObject = false;

        type ZodPropertyDef = {
            description?: string;
            typeName: string;
        };

        // type ZodShape = Record<string, { _def: ZodPropertyDef }>;
        // type PlainObjectShape = Record<string, any>;
        // Narrow the type of `shape` based on whether the input is a Zod object or plain object
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // const shape: ZodShape | PlainObjectShape = isZodObject
        //     ? (mcpToolTriggerOptions.toolProperties as { shape: ZodShape }).shape
        //     : typeof mcpToolTriggerOptions.toolProperties === 'object'
        //     ? mcpToolTriggerOptions.toolProperties
        //     : {};

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (mcpToolTriggerOptions.toolProperties?._def?.typeName === 'ZodObject') {
            isZodObject = true;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const shape: Record<string, any> = isZodObject
            ? (mcpToolTriggerOptions.toolProperties as { shape: Record<string, { _def: ZodPropertyDef }> }).shape
            : mcpToolTriggerOptions.toolProperties; // Handle plain objects directly

        const result = Object.keys(shape).map((propertyName) => {
            const property = shape[propertyName] as { _def: ZodPropertyDef };
            const description = property?._def?.description || '';
            const propertyType = property?._def?.typeName?.toLowerCase() || 'unknown'; // Extract type name or default to "unknown"

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

// }
// // Helper function to infer property type from zod schema
// function getPropertyType(zodType: any): string {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-plus-operands
//     console.log('Here: ' + zodType);
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//     switch (zodType._def.typeName) {
//         case 'ZodNumber':
//             return 'number';
//         case 'ZodString':
//             return 'string';
//         case 'ZodBoolean':
//             return 'boolean';
//         case 'ZodArray':
//             return 'array';
//         case 'ZodObject':
//             return 'object';
//         default:
//             return 'unknown';
//     }
// }

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
