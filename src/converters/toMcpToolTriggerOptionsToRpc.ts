// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { McpToolProperty, McpToolTriggerOptions, McpToolTriggerOptionsToRpc } from '../../types';
import { normalizeToolProperties } from '../utils/toolProperties';

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

    // Try to normalize tool properties first (handles both array and fluent formats)
    let normalizedProperties: McpToolProperty[] | undefined;
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        normalizedProperties = normalizeToolProperties(mcpToolTriggerOptions.toolProperties);
    } catch (error) {
        // Re-throw validation errors from normalizeToolProperties
        if (
            error instanceof Error &&
            (error.message.includes('Property type is required') ||
                error.message.includes('Property type must be specified'))
        ) {
            throw error;
        }
        normalizedProperties = undefined;
    }

    // Validate metadata if provided
    if (mcpToolTriggerOptions.metadata !== undefined) {
        if (typeof mcpToolTriggerOptions.metadata === 'string' && mcpToolTriggerOptions.metadata.trim() !== '') {
            try {
                JSON.parse(mcpToolTriggerOptions.metadata);
            } catch (e) {
                throw new Error('MCP Tool trigger "metadata" must be a valid JSON string.');
            }
        }
    }

    // If we successfully normalized the properties, use them
    if (normalizedProperties !== undefined) {
        const result: McpToolTriggerOptionsToRpc = {
            ...baseResult,
            toolProperties: JSON.stringify(normalizedProperties),
        };
        if (mcpToolTriggerOptions.metadata !== undefined) {
            result.metadata = mcpToolTriggerOptions.metadata;
        }
        return result;
    }

    // Handle cases where toolProperties is not an array
    throw new Error(
        `Invalid toolProperties for tool '${mcpToolTriggerOptions.toolName}': Expected an array of McpToolProperty or ToolProps objects or ToolProps need a type defined.`
    );
}
