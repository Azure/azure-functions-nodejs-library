// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { McpPromptArgument } from '../../types/mcpPrompt';

/**
 * Fluent builder for declaring MCP prompt arguments.
 *
 * Used in the record-style `promptArguments` map where the key is the argument name.
 *
 * @example
 * ```ts
 * promptArguments: {
 *     function_name: promptArg.describe('The function to document.').isRequired(),
 *     style: promptArg.describe("Documentation style (e.g., 'concise', 'verbose')."),
 * }
 * ```
 *
 * @remarks
 * By default, arguments are **not required**. Call `.isRequired()` to mark them as required.
 */
export class McpPromptArgumentBuilder {
    private _description?: string;
    private _required = false;

    /**
     * Set the argument's description shown to MCP clients.
     */
    describe(description: string): this {
        this._description = description;
        return this;
    }

    /**
     * Mark the argument as required. By default arguments are optional.
     */
    isRequired(): this {
        this._required = true;
        return this;
    }

    /**
     * @internal Resolve to the wire-facing {@link McpPromptArgument} shape using the supplied name.
     */
    toPromptArgument(name: string): McpPromptArgument {
        return {
            name,
            description: this._description,
            required: this._required,
        };
    }
}

/**
 * Factory for creating MCP **prompt** argument builders.
 *
 * Kept separate from the tool-property `arg` helper because prompt arguments
 * are untyped (name + description + required only) and should not be mixed
 * with typed tool property builders (`arg.string()`, `arg.number()`, ...).
 *
 * @example
 * ```ts
 * import { promptArg } from '@azure/functions';
 *
 * app.mcpPromptTrigger({
 *     promptName: 'generate_docs',
 *     promptArguments: {
 *         function_name: promptArg.describe('The function to document.').isRequired(),
 *         style: promptArg.describe("Documentation style (e.g., 'concise', 'verbose')."),
 *     },
 *     handler: async (ctx) => { ... },
 * });
 * ```
 */
export const promptArg = {
    /**
     * Start building a prompt argument with a description.
     */
    describe(description: string): McpPromptArgumentBuilder {
        return new McpPromptArgumentBuilder().describe(description);
    },
};
