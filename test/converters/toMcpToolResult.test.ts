// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { toMcpToolResult } from '../../src/converters/toMcpToolResult';
import { McpContent } from '../../src/utils/mcpContentMarker';

describe('toMcpToolResult', () => {
    it('returns nullish values as-is', () => {
        expect(toMcpToolResult(null)).to.equal(null);
        expect(toMcpToolResult(undefined)).to.equal(undefined);
    });

    it('wraps primitive string as text content', () => {
        const result = toMcpToolResult('hello');
        expect(result).to.not.equal(undefined);
        expect(result).to.not.equal(null);
        expect(result?.type).to.equal('text');

        const content = JSON.parse(result?.content || '{}') as { type: string; text: string };
        expect(content.type).to.equal('text');
        expect(content.text).to.equal('hello');
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

    it('converts direct image block and normalizes buffer data to base64', () => {
        const buffer = Buffer.from('abc');
        const result = toMcpToolResult({
            type: 'image',
            data: buffer,
            mimeType: 'image/png',
        });

        expect(result?.type).to.equal('image');
        const content = JSON.parse(result?.content || '{}') as { type: string; data: string };
        expect(content.type).to.equal('image');
        expect(content.data).to.equal(buffer.toString('base64'));
    });

    it('wraps direct content block arrays as multi_content_result', () => {
        const result = toMcpToolResult([
            { type: 'text', text: 'first' },
            { type: 'image', data: 'ZGF0YQ==', mimeType: 'image/png' },
        ]);

        expect(result?.type).to.equal('multi_content_result');
        const content = JSON.parse(result?.content || '[]') as Array<{ type: string }>;
        expect(content).to.have.length(2);
        expect(content[0]?.type).to.equal('text');
        expect(content[1]?.type).to.equal('image');
    });

    it('adds fallback text block for CallToolResult with structuredContent and no text block', () => {
        const result = toMcpToolResult({
            content: [{ type: 'image', data: 'ZGF0YQ==', mimeType: 'image/png' }],
            structuredContent: { id: 'x1' },
        });

        expect(result?.type).to.equal('multi_content_result');
        const content = JSON.parse(result?.content || '[]') as Array<{ type: string; text?: string }>;
        expect(content).to.have.length(2);
        expect(content.some((b) => b.type === 'text')).to.equal(true);
        expect(result?.structuredContent).to.equal(JSON.stringify({ id: 'x1' }));
    });

    it('normalizes existing McpToolResult when content is not a string', () => {
        const result = toMcpToolResult({
            type: 'text',
            content: { type: 'text', text: 'normalized' },
        });

        expect(result?.type).to.equal('text');
        expect(result?.content).to.equal(JSON.stringify({ type: 'text', text: 'normalized' }));
    });

    it('treats resource_link blocks as direct content blocks', () => {
        const result = toMcpToolResult({
            type: 'resource_link',
            uri: 'https://example.test/resource',
            name: 'example',
        });

        expect(result?.type).to.equal('resource_link');
        const content = JSON.parse(result?.content || '{}') as { type: string; uri: string };
        expect(content.type).to.equal('resource_link');
        expect(content.uri).to.equal('https://example.test/resource');
    });
});
