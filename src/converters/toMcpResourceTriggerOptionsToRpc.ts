// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { McpResourceTriggerOptions, McpResourceTriggerOptionsToRpc } from '../../types';

/**
 * Converts an McpResourceTriggerOptions object to an McpResourceTriggerOptionsToRpc object.
 *
 * @param options - The input options to be converted.
 * @returns The converted McpResourceTriggerOptionsToRpc object.
 * @throws Error if required properties are missing or invalid.
 */
export function convertToMcpResourceTriggerOptionsToRpc(
    options: McpResourceTriggerOptions
): McpResourceTriggerOptionsToRpc {
    // Validate required properties
    if (!options.uri || typeof options.uri !== 'string' || options.uri.trim() === '') {
        throw new Error('MCP Resource trigger requires a valid "uri" property.');
    }

    if (!options.resourceName || typeof options.resourceName !== 'string' || options.resourceName.trim() === '') {
        throw new Error('MCP Resource trigger requires a valid "resourceName" property.');
    }

    // Build the result object with required properties
    const result: McpResourceTriggerOptionsToRpc = {
        uri: options.uri,
        resourceName: options.resourceName,
    };

    // Add optional properties if they are defined
    if (options.title !== undefined) {
        result.title = options.title;
    }

    if (options.description !== undefined) {
        result.description = options.description;
    }

    if (options.mimeType !== undefined) {
        result.mimeType = options.mimeType;
    }

    if (options.size !== undefined) {
        if (typeof options.size !== 'number' || options.size < 0) {
            throw new Error('MCP Resource trigger "size" must be a non-negative number.');
        }
        result.size = options.size;
    }

    if (options.metadata !== undefined) {
        result.metadata = options.metadata;
    }

    return result;
}
