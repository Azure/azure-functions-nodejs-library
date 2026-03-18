// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { McpResourceTriggerOptions } from '../../types';

/**
 * Validates and returns an McpResourceTriggerOptions object.
 *
 * @param options - The input options to validate.
 * @returns The validated McpResourceTriggerOptions object.
 * @throws Error if required properties are missing or invalid.
 */
export function convertToMcpResourceTriggerOptionsToRpc(options: McpResourceTriggerOptions): McpResourceTriggerOptions {
    // Validate required properties
    if (!options.uri || typeof options.uri !== 'string' || options.uri.trim() === '') {
        throw new Error('MCP Resource trigger requires a valid "uri" property.');
    }

    if (!options.resourceName || typeof options.resourceName !== 'string' || options.resourceName.trim() === '') {
        throw new Error('MCP Resource trigger requires a valid "resourceName" property.');
    }

    // Build the result object with required properties
    const result: McpResourceTriggerOptions = {
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

    if (options.metadata !== undefined && typeof options.metadata === 'string' && options.metadata.trim() !== '') {
        // Validate that metadata is a valid JSON string
        try {
            JSON.parse(options.metadata);
        } catch (e) {
            throw new Error('MCP Resource trigger "metadata" must be a valid JSON string.');
        }
        result.metadata = options.metadata;
    }

    return result;
}
