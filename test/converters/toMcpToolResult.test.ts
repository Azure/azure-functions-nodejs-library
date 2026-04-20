// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { toMcpToolResult } from '../../src/converters/toMcpToolResult';
import {
    McpAudioContent,
    McpImageContent,
    McpContentBlock,
    McpToolResponse,
    McpResourceContent,
    McpResourceLinkContent,
    McpTextContent,
} from '../../src/mcp/McpToolResponse';
import { McpContent } from '../../src/utils/mcpContentMarker';

describe('toMcpToolResult', () => {
    it('returns nullish values as-is', () => {
        expect(toMcpToolResult(null)).to.equal(null);
        expect(toMcpToolResult(undefined)).to.equal(undefined);
    });

    it('wraps primitive string as text content', () => {
        const result = toMcpToolResult('hello');
        expect(result?.type).to.equal('text');
        const content = JSON.parse(result?.content || '{}') as { type: string; text: string };
        expect(content).to.deep.equal({ type: 'text', text: 'hello' });
        expect(result?.structuredContent).to.equal(undefined);
    });

    it('does not emit structuredContent for plain object', () => {
        const result = toMcpToolResult({ id: 'plain' });
        expect(result?.type).to.equal('text');
        expect(result?.structuredContent).to.equal(undefined);
    });

    it('emits structuredContent for McpContent-marked class instances', () => {
        class MarkedPayload {
            constructor(public id: string) {}
        }
        McpContent(MarkedPayload);

        const instance = new MarkedPayload('p1');
        const result = toMcpToolResult(instance);

        expect(result?.type).to.equal('text');
        expect(result?.structuredContent).to.equal(JSON.stringify(instance));
    });

    it('treats plain object with content array as a plain value (not a CallToolResult)', () => {
        // Previously the structural CallToolResult detector would misclassify this.
        // With class-based detection it must be serialized as plain text.
        const result = toMcpToolResult({ content: ['hello'], status: 'ok' });
        expect(result?.type).to.equal('text');
        const content = JSON.parse(result?.content || '{}') as { type: string; text: string };
        expect(content.type).to.equal('text');
        expect(JSON.parse(content.text)).to.deep.equal({ content: ['hello'], status: 'ok' });
    });

    it('treats user domain object with type field as a plain value', () => {
        // Previously { type: 'report', content: '...' } would be misclassified as an MCP result.
        const result = toMcpToolResult({ type: 'report', content: 'quarterly results' });
        expect(result?.type).to.equal('text');
        const content = JSON.parse(result?.content || '{}') as { type: string; text: string };
        expect(JSON.parse(content.text)).to.deep.equal({ type: 'report', content: 'quarterly results' });
    });

    it('serializes a single McpTextContent block', () => {
        const result = toMcpToolResult(new McpTextContent('hi there'));
        expect(result?.type).to.equal('text');
        expect(JSON.parse(result?.content || '{}')).to.deep.equal({ type: 'text', text: 'hi there' });
    });

    it('serializes an McpImageContent block and normalizes Buffer data to base64', () => {
        const buffer = Buffer.from('abc');
        const result = toMcpToolResult(new McpImageContent({ data: buffer, mimeType: 'image/png' }));
        expect(result?.type).to.equal('image');
        const content = JSON.parse(result?.content || '{}') as { type: string; data: string; mimeType: string };
        expect(content).to.deep.equal({ type: 'image', data: buffer.toString('base64'), mimeType: 'image/png' });
    });

    it('serializes an McpAudioContent block', () => {
        const result = toMcpToolResult(new McpAudioContent({ data: 'ZGF0YQ==', mimeType: 'audio/wav' }));
        expect(result?.type).to.equal('audio');
        const content = JSON.parse(result?.content || '{}');
        expect(content).to.deep.equal({ type: 'audio', data: 'ZGF0YQ==', mimeType: 'audio/wav' });
    });

    it('serializes a McpResourceLinkContent block', () => {
        const result = toMcpToolResult(
            new McpResourceLinkContent({ uri: 'https://example.test/resource', name: 'example' })
        );
        expect(result?.type).to.equal('resource_link');
        const content = JSON.parse(result?.content || '{}') as { type: string; uri: string; name: string };
        expect(content).to.deep.equal({ type: 'resource_link', uri: 'https://example.test/resource', name: 'example' });
    });

    it('wraps arrays of content blocks as multi_content_result', () => {
        const result = toMcpToolResult([
            new McpTextContent('first'),
            new McpImageContent({ data: 'ZGF0YQ==', mimeType: 'image/png' }),
        ]);
        expect(result?.type).to.equal('multi_content_result');
        const content = JSON.parse(result?.content || '[]') as Array<{ type: string }>;
        expect(content).to.have.length(2);
        expect(content[0]?.type).to.equal('text');
        expect(content[1]?.type).to.equal('image');
    });

    it('treats mixed arrays (non-content-block elements) as plain values', () => {
        const result = toMcpToolResult([new McpTextContent('x'), { type: 'text', text: 'raw' }]);
        expect(result?.type).to.equal('text');
    });

    it('serializes McpToolResponse with structuredContent', () => {
        const response = new McpToolResponse({
            content: [new McpTextContent('display text')],
            structuredContent: { id: 'x1' },
        });
        const result = toMcpToolResult(response);
        expect(result?.type).to.equal('text');
        expect(result?.structuredContent).to.equal(JSON.stringify({ id: 'x1' }));
    });

    it('adds fallback text block when McpToolResponse has structuredContent but no McpTextContent', () => {
        const response = new McpToolResponse({
            content: [new McpImageContent({ data: 'ZGF0YQ==', mimeType: 'image/png' })],
            structuredContent: { id: 'x1' },
        });
        const result = toMcpToolResult(response);
        expect(result?.type).to.equal('multi_content_result');
        const content = JSON.parse(result?.content || '[]') as Array<{ type: string; text?: string }>;
        expect(content).to.have.length(2);
        expect(content.some((b) => b.type === 'text')).to.equal(true);
        expect(result?.structuredContent).to.equal(JSON.stringify({ id: 'x1' }));
    });

    it('passes through string structuredContent without re-stringifying', () => {
        const response = new McpToolResponse({
            content: [new McpTextContent('t')],
            structuredContent: 'already-string',
        });
        const result = toMcpToolResult(response);
        expect(result?.structuredContent).to.equal('already-string');
    });

    it('does not emit structuredContent when explicitly null or undefined', () => {
        const nullResp = toMcpToolResult(
            new McpToolResponse({ content: [new McpTextContent('t')], structuredContent: null })
        );
        expect(nullResp?.structuredContent).to.equal(undefined);

        const undefResp = toMcpToolResult(
            new McpToolResponse({ content: [new McpTextContent('t')], structuredContent: undefined })
        );
        expect(undefResp?.structuredContent).to.equal(undefined);
    });

    it('serializes a single McpResourceContent block', () => {
        const result = toMcpToolResult(
            new McpResourceContent({ resource: { uri: 'mem://x', text: 'inline', mimeType: 'text/plain' } })
        );
        expect(result?.type).to.equal('resource');
        const content = JSON.parse(result?.content || '{}') as { type: string; resource: Record<string, unknown> };
        expect(content).to.deep.equal({
            type: 'resource',
            resource: { uri: 'mem://x', text: 'inline', mimeType: 'text/plain' },
        });
    });

    it('serializes a McpResourceContent block with base64-encoded blob', () => {
        const blob = Buffer.from('binary-data');
        const result = toMcpToolResult(
            new McpResourceContent({
                resource: { uri: 'file:///a.bin', mimeType: 'application/octet-stream', blob },
            })
        );
        expect(result?.type).to.equal('resource');
        const content = JSON.parse(result?.content || '{}') as {
            type: string;
            resource: Record<string, unknown>;
        };
        expect(content).to.deep.equal({
            type: 'resource',
            resource: {
                uri: 'file:///a.bin',
                mimeType: 'application/octet-stream',
                blob: blob.toString('base64'),
            },
        });
    });

    it('serializes a McpResourceContent block with only text (omits blob and mimeType)', () => {
        const result = toMcpToolResult(
            new McpResourceContent({ resource: { uri: 'file:///a.txt', text: 'hello' } })
        );
        const content = JSON.parse(result?.content || '{}') as { resource: Record<string, unknown> };
        expect(content.resource).to.deep.equal({ uri: 'file:///a.txt', text: 'hello' });
        expect(content.resource).to.not.have.property('blob');
        expect(content.resource).to.not.have.property('mimeType');
    });

    it('treats empty array as plain value (not a multi_content_result)', () => {
        const result = toMcpToolResult([]);
        expect(result?.type).to.equal('text');
        const content = JSON.parse(result?.content || '{}') as { type: string; text: string };
        expect(content.type).to.equal('text');
        expect(content.text).to.equal('[]');
        expect(JSON.parse(content.text)).to.deep.equal([]);
    });

    it('accepts user-defined McpContentBlock subclasses (extensibility)', () => {
        // Demonstrates the extensibility contract documented on McpContentBlock:
        // a custom subclass flows through the converter with its own type/toJSON shape
        // without any library changes.
        class VideoContent extends McpContentBlock {
            readonly type = 'video' as const;
            constructor(private readonly data: string, private readonly mimeType: string) {
                super();
            }
            toJSON(): Record<string, unknown> {
                return { type: this.type, data: this.data, mimeType: this.mimeType };
            }
        }

        const single = toMcpToolResult(new VideoContent('YmFzZTY0', 'video/mp4'));
        expect(single?.type).to.equal('video');
        expect(JSON.parse(single?.content || '{}')).to.deep.equal({
            type: 'video',
            data: 'YmFzZTY0',
            mimeType: 'video/mp4',
        });

        const mixed = toMcpToolResult(
            new McpToolResponse({
                content: [new McpTextContent('preview'), new VideoContent('YmFzZTY0', 'video/mp4')],
                structuredContent: { scenes: 3 },
            })
        );
        expect(mixed?.type).to.equal('multi_content_result');
        const blocks = JSON.parse(mixed?.content || '[]') as Array<{ type: string }>;
        expect(blocks).to.have.length(2);
        expect(blocks[1]?.type).to.equal('video');
        expect(mixed?.structuredContent).to.equal(JSON.stringify({ scenes: 3 }));
    });
});
