// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type {
    McpAudioContentInit as IAudioContentInit,
    McpImageContentInit as IImageContentInit,
    McpResourceContentInit as IResourceContentInit,
    McpResourceLinkContentInit as IResourceLinkContentInit,
    McpToolResponseInit as IMcpToolResponseInit,
} from '@azure/functions';

type BinaryData = string | Buffer | ArrayBuffer;

function normalizeBinaryData(data: BinaryData): string {
    if (typeof data === 'string') {
        return data;
    }
    if (Buffer.isBuffer(data)) {
        return data.toString('base64');
    }
    if (ArrayBuffer.isView(data)) {
        const view = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        return Buffer.from(view).toString('base64');
    }
    return Buffer.from(new Uint8Array(data)).toString('base64');
}

/**
 * Base class for all MCP content blocks. The library uses `instanceof McpContentBlock`
 * to discriminate content blocks from plain user values, so every content-block subclass
 * must extend this class.
 *
 * ## Extending with custom content block types
 *
 * The library ships built-in subclasses for the MCP spec's current content block types
 * (`McpTextContent`, `McpImageContent`, `McpAudioContent`, `McpResourceLinkContent`, `McpResourceContent`).
 * If the spec adds a new block type — or your scenario needs a custom one — you can ship
 * your own subclass without any library change. The converter only checks
 * `instanceof McpContentBlock` and calls `JSON.stringify(block)`, which invokes your
 * `toJSON()` to produce the wire payload.
 *
 * ### Example: adding a hypothetical `VideoContent`
 *
 * ```ts
 * import { McpContentBlock } from '@azure/functions';
 *
 * export interface VideoContentInit {
 *     data: string | Buffer | ArrayBuffer;
 *     mimeType: string;          // e.g. 'video/mp4'
 *     durationMs?: number;       // optional field from a hypothetical spec
 * }
 *
 * export class VideoContent extends McpContentBlock {
 *     readonly type = 'video' as const;
 *     readonly data: string | Buffer | ArrayBuffer;
 *     readonly mimeType: string;
 *     readonly durationMs?: number;
 *
 *     constructor(init: VideoContentInit) {
 *         super();
 *         this.data = init.data;
 *         this.mimeType = init.mimeType;
 *         this.durationMs = init.durationMs;
 *     }
 *
 *     toJSON(): Record<string, unknown> {
 *         const out: Record<string, unknown> = {
 *             type: this.type,
 *             data: toBase64(this.data),
 *             mimeType: this.mimeType,
 *         };
 *         if (this.durationMs !== undefined) out.durationMs = this.durationMs;
 *         return out;
 *     }
 * }
 *
 * function toBase64(data: string | Buffer | ArrayBuffer): string {
 *     if (typeof data === 'string') return data;
 *     if (Buffer.isBuffer(data)) return data.toString('base64');
 *     return Buffer.from(new Uint8Array(data)).toString('base64');
 * }
 * ```
 *
 * ### Using a custom block from a tool handler
 *
 * Return it standalone, or mix it with built-in blocks inside an `McpToolResponse`:
 *
 * ```ts
 * // Single block
 * handler: async () => new VideoContent({ data: buf, mimeType: 'video/mp4' })
 *
 * // Mixed with built-ins + structured content
 * handler: async () => new McpToolResponse({
 *     content: [
 *         new McpTextContent('Detected 3 scenes'),
 *         new VideoContent({ data: buf, mimeType: 'video/mp4' }),
 *     ],
 *     structuredContent: { scenes: 3, confidence: 0.92 },
 * })
 * ```
 *
 * ### What the library does for you
 *
 *  - `instanceof McpContentBlock` treats your subclass identically to built-in blocks.
 *  - Single-block returns propagate your `type` string to the outer result; arrays are
 *    wrapped as `multi_content_result`.
 *  - `structuredContent` handling, fallback-text synthesis, and nullish passthrough all
 *    apply unchanged.
 *
 * ### What you must get right in your subclass
 *
 *  - `toJSON()` must return the exact wire shape the spec requires for your `type`.
 *  - Binary payloads should be base64-encoded in `toJSON()` (see the `toBase64` helper
 *    above).
 *  - Plain object literals are **not** recognized — you must construct an instance.
 */
export abstract class McpContentBlock {
    abstract readonly type: string;

    /**
     * Returns the wire representation of this block. Subclasses override to normalize
     * binary payloads and omit undefined fields.
     */
    abstract toJSON(): Record<string, unknown>;
}

export class McpTextContent extends McpContentBlock {
    readonly type = 'text' as const;
    readonly text: string;

    constructor(text: string) {
        super();
        this.text = text;
    }

    toJSON(): Record<string, unknown> {
        return { type: this.type, text: this.text };
    }
}

export class McpImageContent extends McpContentBlock {
    readonly type = 'image' as const;
    readonly data: BinaryData;
    readonly mimeType?: string;

    constructor(init: IImageContentInit) {
        super();
        this.data = init.data;
        this.mimeType = init.mimeType;
    }

    toJSON(): Record<string, unknown> {
        const out: Record<string, unknown> = {
            type: this.type,
            data: normalizeBinaryData(this.data),
        };
        if (this.mimeType !== undefined) {
            out.mimeType = this.mimeType;
        }
        return out;
    }
}

export class McpAudioContent extends McpContentBlock {
    readonly type = 'audio' as const;
    readonly data: BinaryData;
    readonly mimeType?: string;

    constructor(init: IAudioContentInit) {
        super();
        this.data = init.data;
        this.mimeType = init.mimeType;
    }

    toJSON(): Record<string, unknown> {
        const out: Record<string, unknown> = {
            type: this.type,
            data: normalizeBinaryData(this.data),
        };
        if (this.mimeType !== undefined) {
            out.mimeType = this.mimeType;
        }
        return out;
    }
}

export class McpResourceLinkContent extends McpContentBlock {
    readonly type = 'resource_link' as const;
    readonly uri: string;
    readonly name?: string;
    readonly description?: string;
    readonly mimeType?: string;

    constructor(init: IResourceLinkContentInit) {
        super();
        this.uri = init.uri;
        this.name = init.name;
        this.description = init.description;
        this.mimeType = init.mimeType;
    }

    toJSON(): Record<string, unknown> {
        const out: Record<string, unknown> = { type: this.type, uri: this.uri };
        if (this.name !== undefined) out.name = this.name;
        if (this.description !== undefined) out.description = this.description;
        if (this.mimeType !== undefined) out.mimeType = this.mimeType;
        return out;
    }
}

export class McpResourceContent extends McpContentBlock {
    readonly type = 'resource' as const;
    readonly resource: IResourceContentInit['resource'];

    constructor(init: IResourceContentInit) {
        super();
        this.resource = init.resource;
    }

    toJSON(): Record<string, unknown> {
        const r = this.resource;
        const inner: Record<string, unknown> = { uri: r.uri };
        if (r.mimeType !== undefined) inner.mimeType = r.mimeType;
        if (r.text !== undefined) inner.text = r.text;
        if (r.blob !== undefined) inner.blob = normalizeBinaryData(r.blob);
        return { type: this.type, resource: inner };
    }
}

/**
 * A complete MCP tool response with explicit content blocks and optional structured content.
 * Return an instance of this class from a tool handler when you need full control over
 * both the content array and `structuredContent`.
 */
export class McpToolResponse {
    readonly content: McpContentBlock[];
    readonly structuredContent?: unknown;
    readonly isError?: boolean;

    constructor(init: IMcpToolResponseInit) {
        this.content = init.content;
        this.structuredContent = init.structuredContent;
        this.isError = init.isError;
    }
}
