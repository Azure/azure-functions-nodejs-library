// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { toMcpToolResult } from '../../src/converters/toMcpToolResult';
import {
    AudioContent,
    ImageContent,
    McpToolResponse,
    ResourceLinkContent,
    TextContent,
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

    it('serializes a single TextContent block', () => {
        const result = toMcpToolResult(new TextContent('hi there'));
        expect(result?.type).to.equal('text');
        expect(JSON.parse(result?.content || '{}')).to.deep.equal({ type: 'text', text: 'hi there' });
    });

    it('serializes an ImageContent block and normalizes Buffer data to base64', () => {
        const buffer = Buffer.from('abc');
        const result = toMcpToolResult(new ImageContent({ data: buffer, mimeType: 'image/png' }));
        expect(result?.type).to.equal('image');
        const content = JSON.parse(result?.content || '{}') as { type: string; data: string; mimeType: string };
        expect(content).to.deep.equal({ type: 'image', data: buffer.toString('base64'), mimeType: 'image/png' });
    });

    it('serializes an AudioContent block', () => {
        const result = toMcpToolResult(new AudioContent({ data: 'ZGF0YQ==', mimeType: 'audio/wav' }));
        expect(result?.type).to.equal('audio');
        const content = JSON.parse(result?.content || '{}');
        expect(content).to.deep.equal({ type: 'audio', data: 'ZGF0YQ==', mimeType: 'audio/wav' });
    });

    it('serializes a ResourceLinkContent block', () => {
        const result = toMcpToolResult(
            new ResourceLinkContent({ uri: 'https://example.test/resource', name: 'example' })
        );
        expect(result?.type).to.equal('resource_link');
        const content = JSON.parse(result?.content || '{}') as { type: string; uri: string; name: string };
        expect(content).to.deep.equal({ type: 'resource_link', uri: 'https://example.test/resource', name: 'example' });
    });

    it('wraps arrays of content blocks as multi_content_result', () => {
        const result = toMcpToolResult([
            new TextContent('first'),
            new ImageContent({ data: 'ZGF0YQ==', mimeType: 'image/png' }),
        ]);
        expect(result?.type).to.equal('multi_content_result');
        const content = JSON.parse(result?.content || '[]') as Array<{ type: string }>;
        expect(content).to.have.length(2);
        expect(content[0]?.type).to.equal('text');
        expect(content[1]?.type).to.equal('image');
    });

    it('treats mixed arrays (non-content-block elements) as plain values', () => {
        const result = toMcpToolResult([new TextContent('x'), { type: 'text', text: 'raw' }]);
        expect(result?.type).to.equal('text');
    });

    it('serializes McpToolResponse with structuredContent', () => {
        const response = new McpToolResponse({
            content: [new TextContent('display text')],
            structuredContent: { id: 'x1' },
        });
        const result = toMcpToolResult(response);
        expect(result?.type).to.equal('text');
        expect(result?.structuredContent).to.equal(JSON.stringify({ id: 'x1' }));
    });

    it('adds fallback text block when McpToolResponse has structuredContent but no TextContent', () => {
        const response = new McpToolResponse({
            content: [new ImageContent({ data: 'ZGF0YQ==', mimeType: 'image/png' })],
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
            content: [new TextContent('t')],
            structuredContent: 'already-string',
        });
        const result = toMcpToolResult(response);
        expect(result?.structuredContent).to.equal('already-string');
    });
});
