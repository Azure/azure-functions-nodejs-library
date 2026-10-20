// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { InvocationContext, McpToolResult } from '@azure/functions';
import { McpContentBlock, McpTextContent, McpToolResponse } from '../mcp/McpToolResponse';
import { warnIfLooksLikeMcpSdkValue } from '../mcp/sdkCompat';
import { shouldCreateStructuredContentMarker } from '../utils/mcpContentMarker';

const multiContentResultType = 'multi_content_result';
const textContentResultType = 'text';
const callToolResultType = 'call_tool_result';

/**
 * Converts a tool handler's return value into the wire-format MCP tool result.
 *
 * Accepted inputs:
 *  - `null` / `undefined` → passed through.
 *  - `McpToolResponse` instance → serialized as-is.
 *  - `McpContentBlock` instance → wrapped in a single-block response.
 *  - Non-empty array of `McpContentBlock` instances → wrapped in a multi-block response.
 *  - Any other value → serialized as a text block. If the value's class is marked with
 *    `@McpContent`, it is also emitted as `structuredContent`.
 *
 * Detection uses `instanceof` exclusively — arbitrary user objects that happen to have a
 * `content`/`type`/`structuredContent` field are treated as plain values.
 *
 * @param context Optional `InvocationContext` used to surface a one-time warning when the
 *   value looks like an `@modelcontextprotocol/sdk` response that is not auto-converted.
 */
export function toMcpToolResult(result: unknown, context?: InvocationContext): McpToolResult | null | undefined {
    if (result === null || result === undefined) {
        return result;
    }

    if (result instanceof McpToolResponse) {
        return serializeToolResponse(result);
    }

    if (result instanceof McpContentBlock) {
        return serializeToolResponse(new McpToolResponse({ content: [result] }));
    }

    if (Array.isArray(result) && result.length > 0 && result.every((b) => b instanceof McpContentBlock)) {
        return serializeToolResponse(new McpToolResponse({ content: result as McpContentBlock[] }));
    }

    // Plain-value path: warn once if the value looks like an MCP SDK shape that
    // the user likely intended to be converted. Behavior is unchanged.
    warnIfLooksLikeMcpSdkValue(result, context);

    const text = typeof result === 'string' ? result : JSON.stringify(result);
    const mcpResult: McpToolResult = {
        type: textContentResultType,
        content: JSON.stringify({ type: textContentResultType, text }),
    };

    if (shouldCreateStructuredContentMarker(result)) {
        mcpResult.structuredContent = JSON.stringify(result);
    }

    return mcpResult;
}

function serializeToolResponse(response: McpToolResponse): McpToolResult {
    const blocks = ensureTextBlockWhenStructured(response);

    // When `isError` is set, route the response through the host's `call_tool_result`
    // passthrough so the boolean reaches the MCP client. The host's ToolReturnValueBinder
    // recognizes `type == "call_tool_result"` and deserializes `content` directly into
    // the MCP SDK's full `CallToolResult` (including `isError`, `structuredContent`, `_meta`).
    // The non-passthrough envelope only carries `content` + `structuredContent`, so any
    // `isError` value would otherwise be silently dropped.
    if (response.isError !== undefined) {
        return serializeAsCallToolResult(response, blocks);
    }

    let type: string;
    let contentStr: string;
    if (blocks.length === 1) {
        const [block] = blocks as [McpContentBlock];
        type = block.type;
        contentStr = JSON.stringify(block);
    } else {
        type = multiContentResultType;
        contentStr = JSON.stringify(blocks);
    }

    const out: McpToolResult = { type, content: contentStr };

    if (response.structuredContent !== undefined && response.structuredContent !== null) {
        out.structuredContent =
            typeof response.structuredContent === 'string'
                ? response.structuredContent
                : JSON.stringify(response.structuredContent);
    }

    return out;
}

function serializeAsCallToolResult(response: McpToolResponse, blocks: McpContentBlock[]): McpToolResult {
    const callToolResult: Record<string, unknown> = {
        content: blocks.map((b) => b.toJSON()),
        isError: response.isError,
    };

    let structuredEnvelope: string | undefined;
    if (response.structuredContent !== undefined && response.structuredContent !== null) {
        if (typeof response.structuredContent === 'string') {
            // Already-serialized JSON: embed parsed value in the CallToolResult payload
            // and surface the raw string on the envelope (matches the .NET SDK shape).
            try {
                callToolResult.structuredContent = JSON.parse(response.structuredContent);
            } catch {
                callToolResult.structuredContent = response.structuredContent;
            }
            structuredEnvelope = response.structuredContent;
        } else {
            callToolResult.structuredContent = response.structuredContent;
            structuredEnvelope = JSON.stringify(response.structuredContent);
        }
    }

    const out: McpToolResult = {
        type: callToolResultType,
        content: JSON.stringify(callToolResult),
    };

    if (structuredEnvelope !== undefined) {
        out.structuredContent = structuredEnvelope;
    }

    return out;
}

/**
 * Some MCP clients require a text content block alongside structured content for display.
 * If the response declares `structuredContent` but has no `McpTextContent` block, synthesize one.
 */
function ensureTextBlockWhenStructured(response: McpToolResponse): McpContentBlock[] {
    if (response.structuredContent === null || response.structuredContent === undefined) {
        return response.content;
    }

    if (response.content.some((b) => b instanceof McpTextContent)) {
        return response.content;
    }

    const fallbackText =
        typeof response.structuredContent === 'string'
            ? response.structuredContent
            : JSON.stringify(response.structuredContent);

    return [...response.content, new McpTextContent(fallbackText)];
}
