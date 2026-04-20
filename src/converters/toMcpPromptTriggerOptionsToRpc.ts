// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { McpPromptArgument, McpPromptTriggerOptions, McpPromptTriggerOptionsToRpc } from '../../types/mcpPrompt';

/**
 * Converts an {@link McpPromptTriggerOptions} object to the wire-format
 * {@link McpPromptTriggerOptionsToRpc} the Functions host expects.
 *
 * - `promptName` is required.
 * - `promptArguments` is serialized to a compact JSON string (always present on the wire).
 * - `metadata` and `icons` are validated as JSON strings when supplied.
 */
export function convertToMcpPromptTriggerOptionsToRpc(options: McpPromptTriggerOptions): McpPromptTriggerOptionsToRpc {
    if (!options.promptName || typeof options.promptName !== 'string' || options.promptName.trim() === '') {
        throw new Error('MCP Prompt trigger requires a valid "promptName" property.');
    }

    const promptArgumentsJson = serializePromptArguments(options.promptArguments);

    const result: McpPromptTriggerOptionsToRpc = {
        promptName: options.promptName,
        promptArguments: promptArgumentsJson,
    };

    if (options.title !== undefined) {
        result.title = options.title;
    }

    if (options.description !== undefined) {
        result.description = options.description;
    }

    if (options.metadata !== undefined && typeof options.metadata === 'string' && options.metadata.trim() !== '') {
        try {
            JSON.parse(options.metadata);
        } catch {
            throw new Error('MCP Prompt trigger "metadata" must be a valid JSON string.');
        }
        result.metadata = options.metadata;
    }

    if (options.icons !== undefined && typeof options.icons === 'string' && options.icons.trim() !== '') {
        try {
            JSON.parse(options.icons);
        } catch {
            throw new Error('MCP Prompt trigger "icons" must be a valid JSON string.');
        }
        result.icons = options.icons;
    }

    return result;
}

function serializePromptArguments(args: McpPromptArgument[] | undefined): string {
    if (!args || args.length === 0) {
        return '[]';
    }

    const normalized = args.map((arg) => {
        if (!arg.name || typeof arg.name !== 'string' || arg.name.trim() === '') {
            throw new Error('MCP Prompt trigger "promptArguments" entries require a non-empty "name".');
        }
        return {
            name: arg.name,
            description: arg.description ?? null,
            required: arg.required === true,
        };
    });

    return JSON.stringify(normalized);
}
