// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

/**
 * A handler function for MCP Prompt triggers.
 *
 * @param context - Structured `PromptInvocationContext` describing the prompt invocation.
 * @param invocationContext - The invocation context for the function.
 * @returns A result that can be a promise or a synchronous value.
 */
export type McpPromptTriggerHandler<T = PromptInvocationContext> = (
    context: T,
    invocationContext: InvocationContext
) => FunctionResult;

/**
 * Configuration options for an MCP Prompt function.
 * This includes trigger-specific options and general function options.
 */
export interface McpPromptFunctionOptions<T = PromptInvocationContext>
    extends McpPromptTriggerOptions,
        Partial<FunctionOptions> {
    /**
     * The handler function to execute when the trigger is invoked.
     */
    handler: McpPromptTriggerHandler<T>;

    /**
     * The trigger configuration for the MCP Prompt.
     */
    trigger?: McpPromptTrigger;
}

/**
 * Describes a single argument accepted by an MCP prompt.
 */
export interface McpPromptArgument {
    /**
     * The argument name.
     */
    name: string;

    /**
     * Optional description of the argument shown to MCP clients.
     */
    description?: string;

    /**
     * Whether the argument is required. Defaults to `false`.
     */
    required?: boolean;
}

/**
 * Fluent builder for declaring MCP prompt arguments in a record-shaped
 * `promptArguments` map. The key of the map supplies the argument name.
 *
 * By default arguments are **optional**; call `.isRequired()` to mark them required.
 *
 * @example
 * ```ts
 * promptArguments: {
 *     function_name: promptArg.describe('The function to document.').isRequired(),
 *     style: promptArg.describe("Documentation style (e.g., 'concise', 'verbose')."),
 * }
 * ```
 */
export declare class McpPromptArgumentBuilder {
    /** Set the argument's description. */
    describe(description: string): this;

    /** Mark the argument as required. Default is optional. */
    isRequired(): this;
}

/**
 * Factory for creating MCP **prompt** argument builders.
 *
 * Kept separate from the tool-property `arg` helper because prompt arguments
 * are untyped (only `name`, optional `description`, and a `required` flag).
 */
export declare const promptArg: {
    /** Start building a prompt argument with a description. */
    describe(description: string): McpPromptArgumentBuilder;
};

/**
 * Accepted shapes for declaring prompt arguments.
 *
 * - **Array form** (explicit): an array of {@link McpPromptArgument} objects with `name`, optional `description` and `required`.
 * - **Record/fluent form**: an object whose keys are argument names and values are {@link McpPromptArgumentBuilder} instances built from `promptArg.describe(...)`.
 */
export type McpPromptArguments = McpPromptArgument[] | Record<string, McpPromptArgumentBuilder>;

/**
 * Configuration options for an MCP Prompt trigger.
 * These options define the behavior and metadata for the trigger.
 */
export interface McpPromptTriggerOptions {
    /**
     * Unique name of the prompt.
     */
    promptName: string;

    /**
     * Optional list of arguments the prompt accepts.
     *
     * Supports two shapes:
     * - An array of {@link McpPromptArgument} objects (explicit `name`/`description`/`required`).
     * - A record/fluent map built with `promptArg.describe(...)` where keys are argument names.
     */
    promptArguments?: McpPromptArguments;

    /**
     * Optional human-readable title for display purposes.
     */
    title?: string;

    /**
     * Optional description of the prompt.
     */
    description?: string;

    /**
     * Optional JSON-serialized metadata object.
     */
    metadata?: string;

    /**
     * Optional JSON-serialized array of icon objects.
     */
    icons?: string;
}

/**
 * The wire-format options sent to the Functions host for an MCP Prompt trigger.
 * `promptArguments` is serialized to a JSON string as required by the host binding contract.
 */
export interface McpPromptTriggerOptionsToRpc {
    promptName: string;
    promptArguments?: string;
    title?: string;
    description?: string;
    metadata?: string;
    icons?: string;
}

/**
 * Represents an MCP Prompt trigger, combining base function trigger options
 * with MCP Prompt-specific trigger options.
 */
export type McpPromptTrigger = FunctionTrigger & McpPromptTriggerOptionsToRpc;

/**
 * Structured context object passed to MCP prompt handlers.
 *
 * Provides typed access to the invoked prompt's name, arguments (all values are strings),
 * optional session id, and optional transport metadata.
 *
 * @example
 * ```ts
 * app.mcpPrompt('codeReview', {
 *     promptName: 'code_review',
 *     promptArguments: [
 *         { name: 'code', description: 'The code to review', required: true },
 *         { name: 'language', description: 'Programming language' }
 *     ],
 *     handler: async (ctx: PromptInvocationContext) => {
 *         const code = ctx.arguments.code ?? '';
 *         const language = ctx.arguments.language ?? 'typescript';
 *         return `Review this ${language} code:\n${code}`;
 *     }
 * });
 * ```
 */
export declare class PromptInvocationContext {
    /**
     * Build a `PromptInvocationContext` from raw host-supplied trigger data.
     * Accepts either a parsed object or a JSON string.
     */
    constructor(data: unknown);

    /** The name of the prompt being invoked. */
    readonly name: string;

    /** Dictionary of prompt arguments (all values are strings). */
    readonly arguments: Record<string, string>;

    /** Optional session ID for the invocation. */
    readonly sessionId: string | undefined;

    /** Optional transport metadata. */
    readonly transport: Record<string, unknown> | undefined;
}
