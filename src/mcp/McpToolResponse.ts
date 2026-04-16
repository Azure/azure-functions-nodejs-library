// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type {
    AudioContentInit as IAudioContentInit,
    ImageContentInit as IImageContentInit,
    McpToolResponseInit as IMcpToolResponseInit,
    ResourceContentInit as IResourceContentInit,
    ResourceLinkContentInit as IResourceLinkContentInit,
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
 */
export abstract class McpContentBlock {
    abstract readonly type: string;

    /**
     * Returns the wire representation of this block. Subclasses override to normalize
     * binary payloads and omit undefined fields.
     */
    abstract toJSON(): Record<string, unknown>;
}

export class TextContent extends McpContentBlock {
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

export class ImageContent extends McpContentBlock {
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

export class AudioContent extends McpContentBlock {
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

export class ResourceLinkContent extends McpContentBlock {
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

export class ResourceContent extends McpContentBlock {
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
