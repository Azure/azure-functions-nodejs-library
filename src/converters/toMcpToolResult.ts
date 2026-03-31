// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { McpToolResult } from '@azure/functions';

interface TextContentBlock {
    type: 'text';
    text: string;
}

const callToolResultType = 'call_tool_result';
const textContentResultType = 'text';

export function toMcpToolResult(result: unknown): McpToolResult | null | undefined {
    if (result === null || result === undefined) {
        return result;
    }

    if (isMcpToolResult(result)) {
        return result;
    }

    if (isCallToolResult(result)) {
        return {
            type: callToolResultType,
            content: JSON.stringify(result),
            structuredContent: serializeStructuredContent(result.structuredContent),
        };
    }

    const text = typeof result === 'string' ? result : JSON.stringify(result);
    const mcpResult: McpToolResult = {
        type: textContentResultType,
        content: JSON.stringify({ type: textContentResultType, text } as TextContentBlock),
    };

    if (shouldCreateStructuredContent(result)) {
        mcpResult.structuredContent = JSON.stringify(result);
    }

    return mcpResult;
}

function shouldCreateStructuredContent(result: unknown): boolean {
    if (!result || typeof result !== 'object') {
        return false;
    }

    if (Array.isArray(result)) {
        return false;
    }

    if (
        result instanceof Date ||
        result instanceof RegExp ||
        result instanceof ArrayBuffer ||
        ArrayBuffer.isView(result) ||
        Buffer.isBuffer(result)
    ) {
        return false;
    }

    return true;
}

function isMcpToolResult(value: unknown): value is McpToolResult {
    return !!value && typeof value === 'object' && typeof (value as McpToolResult).type === 'string';
}

function isCallToolResult(value: unknown): value is { content: unknown; structuredContent?: unknown } {
    return !!value && typeof value === 'object' && Array.isArray((value as { content?: unknown }).content);
}

function serializeStructuredContent(content: unknown): string | undefined {
    if (content === null || content === undefined) {
        return undefined;
    }

    if (typeof content === 'string') {
        return content;
    }

    return JSON.stringify(content);
}
