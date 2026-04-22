// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import {
    McpAudioContent,
    McpContentBlock,
    McpImageContent,
    McpResourceContent,
    McpResourceLinkContent,
    McpTextContent,
    McpToolResponse,
} from '../../src/mcp/McpToolResponse';

describe('MCP content block classes', () => {
    describe('McpContentBlock inheritance', () => {
        it('built-in classes are instances of McpContentBlock', () => {
            expect(new McpTextContent('x')).to.be.instanceOf(McpContentBlock);
            expect(new McpImageContent({ data: 'a', mimeType: 'image/png' })).to.be.instanceOf(McpContentBlock);
            expect(new McpAudioContent({ data: 'a', mimeType: 'audio/wav' })).to.be.instanceOf(McpContentBlock);
            expect(new McpResourceLinkContent({ uri: 'u' })).to.be.instanceOf(McpContentBlock);
            expect(new McpResourceContent({ resource: { uri: 'u' } })).to.be.instanceOf(McpContentBlock);
        });
    });

    describe('McpTextContent', () => {
        it('stores text and emits the canonical wire shape', () => {
            const block = new McpTextContent('hi');
            expect(block.type).to.equal('text');
            expect(block.text).to.equal('hi');
            expect(block.toJSON()).to.deep.equal({ type: 'text', text: 'hi' });
            expect(JSON.parse(JSON.stringify(block))).to.deep.equal({ type: 'text', text: 'hi' });
        });

        it('handles empty string', () => {
            expect(new McpTextContent('').toJSON()).to.deep.equal({ type: 'text', text: '' });
        });
    });

    describe('McpImageContent', () => {
        it('passes through string data unchanged', () => {
            const json = new McpImageContent({ data: 'YmFzZTY0', mimeType: 'image/png' }).toJSON();
            expect(json).to.deep.equal({ type: 'image', data: 'YmFzZTY0', mimeType: 'image/png' });
        });

        it('base64-encodes Buffer data', () => {
            const buf = Buffer.from('abc');
            const json = new McpImageContent({ data: buf, mimeType: 'image/png' }).toJSON();
            expect(json.data).to.equal(buf.toString('base64'));
        });

        it('base64-encodes ArrayBuffer data', () => {
            const ab = new ArrayBuffer(3);
            new Uint8Array(ab).set([97, 98, 99]); // 'abc'
            const json = new McpImageContent({ data: ab, mimeType: 'image/png' }).toJSON();
            expect(json.data).to.equal(Buffer.from('abc').toString('base64'));
        });

        it('base64-encodes ArrayBufferView (Uint8Array) data', () => {
            const view = new Uint8Array([97, 98, 99]);
            const json = new McpImageContent({ data: view, mimeType: 'image/png' }).toJSON();
            expect(json.data).to.equal(Buffer.from('abc').toString('base64'));
        });

        it('omits mimeType when undefined', () => {
            const json = new McpImageContent({ data: 'abc' }).toJSON();
            expect(json).to.deep.equal({ type: 'image', data: 'abc' });
            expect('mimeType' in json).to.equal(false);
        });
    });

    describe('McpAudioContent', () => {
        it('base64-encodes Buffer data and preserves mimeType', () => {
            const buf = Buffer.from('xyz');
            const json = new McpAudioContent({ data: buf, mimeType: 'audio/wav' }).toJSON();
            expect(json).to.deep.equal({ type: 'audio', data: buf.toString('base64'), mimeType: 'audio/wav' });
        });

        it('omits mimeType when undefined', () => {
            const json = new McpAudioContent({ data: 'abc' }).toJSON();
            expect(json).to.deep.equal({ type: 'audio', data: 'abc' });
        });
    });

    describe('McpResourceLinkContent', () => {
        it('emits all fields when provided', () => {
            const json = new McpResourceLinkContent({
                uri: 'https://example.test',
                name: 'n',
                description: 'd',
                mimeType: 'text/plain',
            }).toJSON();
            expect(json).to.deep.equal({
                type: 'resource_link',
                uri: 'https://example.test',
                name: 'n',
                description: 'd',
                mimeType: 'text/plain',
            });
        });

        it('omits optional fields when undefined', () => {
            const json = new McpResourceLinkContent({ uri: 'https://example.test' }).toJSON();
            expect(json).to.deep.equal({ type: 'resource_link', uri: 'https://example.test' });
            expect('name' in json).to.equal(false);
            expect('description' in json).to.equal(false);
            expect('mimeType' in json).to.equal(false);
        });
    });

    describe('McpResourceContent', () => {
        it('emits a text resource with only uri + text', () => {
            const json = new McpResourceContent({
                resource: { uri: 'mem://x', text: 'inline' },
            }).toJSON();
            expect(json).to.deep.equal({ type: 'resource', resource: { uri: 'mem://x', text: 'inline' } });
        });

        it('base64-encodes Buffer blob', () => {
            const buf = Buffer.from('abc');
            const json = new McpResourceContent({
                resource: { uri: 'mem://x', blob: buf, mimeType: 'application/octet-stream' },
            }).toJSON() as { resource: { blob: string; mimeType: string; uri: string } };
            expect(json.resource.blob).to.equal(buf.toString('base64'));
            expect(json.resource.mimeType).to.equal('application/octet-stream');
        });

        it('omits optional fields when undefined', () => {
            const json = new McpResourceContent({ resource: { uri: 'mem://x' } }).toJSON() as {
                resource: Record<string, unknown>;
            };
            expect(json.resource).to.deep.equal({ uri: 'mem://x' });
        });
    });

    describe('McpToolResponse constructor', () => {
        it('accepts content-only init', () => {
            const r = new McpToolResponse({ content: [new McpTextContent('x')] });
            expect(r.content).to.have.length(1);
            expect(r.structuredContent).to.equal(undefined);
            expect(r.isError).to.equal(undefined);
        });

        it('accepts structuredContent and isError', () => {
            const r = new McpToolResponse({
                content: [new McpTextContent('x')],
                structuredContent: { id: 'x' },
                isError: true,
            });
            expect(r.structuredContent).to.deep.equal({ id: 'x' });
            expect(r.isError).to.equal(true);
        });
    });
});
