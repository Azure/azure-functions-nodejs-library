// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { InvocationContext } from '@azure/functions';

/**
 * Heuristically detects values that look like responses from `@modelcontextprotocol/sdk`
 * (e.g. `CallToolResult` or a raw content block) so we can warn users that those shapes
 * are not auto-converted. Detection is intentionally broad — false positives only cost
 * a one-time log line, never a behavior change.
 */
export function looksLikeMcpSdkValue(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const obj = value as Record<string, unknown>;

    // CallToolResult-like: has a content array.
    if (Array.isArray(obj.content)) {
        return true;
    }

    // Content-block-like: has { type: string } plus a known block field.
    if (typeof obj.type === 'string') {
        return 'text' in obj || 'data' in obj || 'uri' in obj || 'resource' in obj;
    }

    return false;
}

let warned = false;

/**
 * Logs a one-time warning when a tool handler returns a value that looks like an
 * `@modelcontextprotocol/sdk` response. Behavior is unchanged — the value still falls
 * through to the plain-text path — but the warning steers users to the supported API.
 *
 * Routed through the invocation's `InvocationContext` so the warning surfaces to the
 * customer via the Functions host logging pipeline. If no context is supplied, the
 * warning is skipped.
 *
 * Idempotent: subsequent calls are no-ops to avoid log spam.
 */
export function warnIfLooksLikeMcpSdkValue(value: unknown, context: InvocationContext | undefined): void {
    if (warned || !context || !looksLikeMcpSdkValue(value)) {
        return;
    }
    warned = true;
    context.warn(
        '[@azure/functions] Tool handler return value appears to use types from ' +
            '`@modelcontextprotocol/sdk` (e.g. `CallToolResult`, `TextContent`, `ImageContent`). ' +
            'These types are not supported directly and will be serialized as plain text. ' +
            'Use the equivalent classes from `@azure/functions` instead — ' +
            '`McpToolResponse`, `McpTextContent`, `McpImageContent`, etc. ' +
            'See the `McpContentBlock` JSDoc for custom content block examples.'
    );
}

/**
 * Test-only: reset the one-time warning flag so each test starts from a clean state.
 * @internal
 */
export function __resetMcpSdkWarning(): void {
    warned = false;
}
