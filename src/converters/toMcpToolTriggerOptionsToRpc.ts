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
    // Validate metadata if provided - skip empty/whitespace strings
    let validatedMetadata: string | undefined;
    if (
        mcpToolTriggerOptions.metadata !== undefined &&
        typeof mcpToolTriggerOptions.metadata === 'string' &&
        mcpToolTriggerOptions.metadata.trim() !== ''
    ) {
        try {
            JSON.parse(mcpToolTriggerOptions.metadata);
            validatedMetadata = mcpToolTriggerOptions.metadata;
        } catch (e) {
            throw new Error('MCP Tool trigger "metadata" must be a valid JSON string.');
        }
    }

    // Base object for the return value - metadata is independent of toolProperties
    const baseResult = {
        toolName: mcpToolTriggerOptions.toolName,
        description: mcpToolTriggerOptions.description,
        ...(validatedMetadata !== undefined && { metadata: validatedMetadata }),
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

    // If we successfully normalized the properties, use them
    if (normalizedProperties !== undefined) {
        return {
            ...baseResult,
            toolProperties: JSON.stringify(normalizedProperties),
        };
    }

    // Handle cases where toolProperties is not an array
    throw new Error(
        `Invalid toolProperties for tool '${mcpToolTriggerOptions.toolName}': Expected an array of McpToolProperty or ToolProps objects or ToolProps need a type defined.`
    );
}
