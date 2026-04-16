// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { McpToolResult } from '@azure/functions';
import { shouldCreateStructuredContentMarker } from '../utils/mcpContentMarker';

interface TextContentBlock {
    type: 'text';
    text: string;
}

const multiContentResultType = 'multi_content_result';
const textContentResultType = 'text';
const directContentBlockTypes = new Set(['text', 'image', 'audio', 'resource', 'resource_link']);

interface CallToolResultLike {
    content: unknown[];
    structuredContent?: unknown;
}

/**
 * Converts a tool return value into a normalized MCP tool result.
 *
 * Supported inputs include CallToolResult-like objects, direct content blocks,
 * arrays of content blocks, existing MCP results, and plain values.
 */
export function toMcpToolResult(result: unknown): McpToolResult | null | undefined {
    if (result === null || result === undefined) {
        return result;
    }

    if (isCallToolResult(result)) {
        const callToolResult = ensureCallToolResultHasTextContent(result);
        const normalizedBlocks = normalizeContentBlocks(callToolResult.content);
        const mcpResult = createMcpToolResultFromContentBlocks(normalizedBlocks);
        mcpResult.structuredContent = serializeStructuredContent(callToolResult.structuredContent);
        return mcpResult;
    }

    if (isContentBlockArray(result)) {
        const normalizedBlocks = normalizeContentBlocks(result);
        const mcpResult = createMcpToolResultFromContentBlocks(normalizedBlocks);
        return mcpResult;
    }

    if (isContentBlock(result)) {
        const normalizedBlock = normalizeContentBlock(result);
        const mcpResult = createMcpToolResultFromContentBlocks([normalizedBlock]);
        return mcpResult;
    }

    if (isMcpToolResult(result)) {
        return normalizeMcpToolResult(result);
    }

    const text = typeof result === 'string' ? result : JSON.stringify(result);
    const mcpResult: McpToolResult = {
        type: textContentResultType,
        content: JSON.stringify({ type: textContentResultType, text } as TextContentBlock),
    };

    if (shouldCreateStructuredContentMarker(result)) {
        mcpResult.structuredContent = JSON.stringify(result);
    }

    return mcpResult;
}

/**
 * Creates an MCP tool result from one or many normalized content blocks.
 * A single block preserves its own type; multiple blocks become multi_content_result.
 */
function createMcpToolResultFromContentBlocks(content: unknown[]): McpToolResult {
    if (content.length === 1) {
        const [block] = content;
        const blockType = getContentBlockType(block);
        return {
            type: blockType,
            content: JSON.stringify(block),
        };
    }

    return {
        type: multiContentResultType,
        content: JSON.stringify(content),
    };
}

/**
 * Normalizes all blocks in a content array.
 */
function normalizeContentBlocks(content: unknown[]): unknown[] {
    return content.map((block) => normalizeContentBlock(block));
}

/**
 * Normalizes one content block and base64-encodes binary payloads for image/audio.
 */
function normalizeContentBlock(block: unknown): unknown {
    if (!block || typeof block !== 'object') {
        return block;
    }

    const contentBlock = { ...(block as Record<string, unknown>) };
    const type = getContentBlockType(contentBlock);

    if ((type === 'image' || type === 'audio') && 'data' in contentBlock) {
        contentBlock.data = normalizeBinaryData(contentBlock.data);
    }

    return contentBlock;
}

/**
 * Converts binary-like values into base64 strings when possible.
 */
function normalizeBinaryData(data: unknown): unknown {
    if (typeof data === 'string' || data === null || data === undefined) {
        return data;
    }

    if (Buffer.isBuffer(data)) {
        return data.toString('base64');
    }

    if (ArrayBuffer.isView(data)) {
        const view = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        return Buffer.from(view).toString('base64');
    }

    if (data instanceof ArrayBuffer) {
        return Buffer.from(new Uint8Array(data)).toString('base64');
    }

    return data;
}

/**
 * Checks whether a value already looks like an MCP tool result payload.
 */
function isMcpToolResult(value: unknown): value is McpToolResult {
    return (
        !!value &&
        typeof value === 'object' &&
        typeof (value as McpToolResult).type === 'string' &&
        ('content' in (value as Record<string, unknown>) || 'structuredContent' in (value as Record<string, unknown>))
    );
}

/**
 * Checks whether a value is a single direct content block.
 */
function isContentBlock(value: unknown): value is Record<string, unknown> & { type: string } {
    return (
        !!value &&
        typeof value === 'object' &&
        typeof (value as { type?: unknown }).type === 'string' &&
        !('content' in (value as Record<string, unknown>)) &&
        directContentBlockTypes.has((value as { type: string }).type)
    );
}

/**
 * Checks whether a value is a non-empty array of direct content blocks.
 */
function isContentBlockArray(value: unknown): value is Array<Record<string, unknown> & { type: string }> {
    return Array.isArray(value) && value.length > 0 && value.every((item) => isContentBlock(item));
}

/**
 * Normalizes an existing MCP tool result by serializing non-string fields.
 */
function normalizeMcpToolResult(result: McpToolResult): McpToolResult {
    return {
        ...result,
        content: serializeOptionalContent(result.content),
        structuredContent: serializeStructuredContent(result.structuredContent),
    };
}

/**
 * Serializes optional content when present and non-string.
 */
function serializeOptionalContent(content: unknown): string | undefined {
    if (content === null || content === undefined) {
        return undefined;
    }

    if (typeof content === 'string') {
        return content;
    }

    return JSON.stringify(content);
}

/**
 * Checks whether a value matches the minimal CallToolResult shape.
 */
function isCallToolResult(value: unknown): value is CallToolResultLike {
    return !!value && typeof value === 'object' && Array.isArray((value as { content?: unknown }).content);
}

/**
 * Ensures CallToolResult content includes a text block when structuredContent exists.
 *
 * Some MCP clients require text in addition to structured content for display.
 */
function ensureCallToolResultHasTextContent(result: CallToolResultLike): CallToolResultLike {
    if (
        result.structuredContent === null ||
        result.structuredContent === undefined ||
        hasTextContentBlock(result.content)
    ) {
        return result;
    }

    const fallbackText =
        typeof result.structuredContent === 'string'
            ? result.structuredContent
            : JSON.stringify(result.structuredContent);

    return {
        ...result,
        content: [...result.content, { type: textContentResultType, text: fallbackText }],
    };
}

/**
 * Returns a content block type, defaulting to text for malformed blocks.
 */
function getContentBlockType(block: unknown): string {
    if (block && typeof block === 'object' && typeof (block as { type?: unknown }).type === 'string') {
        return (block as { type: string }).type;
    }

    return textContentResultType;
}

/**
 * Returns true when at least one content block is a text block.
 */
function hasTextContentBlock(content: unknown[]): boolean {
    return content.some((block) => {
        return !!block && typeof block === 'object' && (block as { type?: unknown }).type === textContentResultType;
    });
}

/**
 * Serializes structured content when present and non-string.
 */
function serializeStructuredContent(content: unknown): string | undefined {
    if (content === null || content === undefined) {
        return undefined;
    }

    if (typeof content === 'string') {
        return content;
    }

    return JSON.stringify(content);
}
