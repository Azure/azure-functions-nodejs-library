// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { InvocationContext, McpToolResult } from '@azure/functions';
import { McpContentBlock, McpTextContent, McpToolResponse } from '../mcp/McpToolResponse';
import { warnIfLooksLikeMcpSdkValue } from '../mcp/sdkCompat';
import { shouldCreateStructuredContentMarker } from '../utils/mcpContentMarker';

const multiContentResultType = 'multi_content_result';
const textContentResultType = 'text';

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
