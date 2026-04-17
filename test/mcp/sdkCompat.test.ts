// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { toMcpToolResult } from '../../src/converters/toMcpToolResult';
import { McpToolResponse, TextContent } from '../../src/mcp/McpToolResponse';
import { __resetMcpSdkWarning } from '../../src/mcp/sdkCompat';

describe('MCP SDK compat', () => {
    let warnStub: sinon.SinonStub;

    beforeEach(() => {
        __resetMcpSdkWarning();
        warnStub = sinon.stub(console, 'warn');
    });

    afterEach(() => {
        warnStub.restore();
        __resetMcpSdkWarning();
    });

    describe('one-time warning on SDK-shaped values', () => {
        it('warns when value has a content array', () => {
            toMcpToolResult({ content: [{ type: 'text', text: 'x' }] });
            expect(warnStub.calledOnce).to.equal(true);
            expect(warnStub.firstCall.args[0]).to.match(/looks like an @modelcontextprotocol\/sdk response/);
        });

        it('warns when value has type + text/data/uri/resource', () => {
            toMcpToolResult({ type: 'text', text: 'x' });
            expect(warnStub.calledOnce).to.equal(true);
        });

        it('does not warn for unrelated plain values', () => {
            toMcpToolResult({ id: 'plain' });
            toMcpToolResult('hello');
            toMcpToolResult(42);
            expect(warnStub.notCalled).to.equal(true);
        });

        it('only warns once across multiple invocations', () => {
            toMcpToolResult({ content: [{ type: 'text', text: 'x' }] });
            toMcpToolResult({ type: 'text', text: 'y' });
            toMcpToolResult({ content: [] });
            expect(warnStub.callCount).to.equal(1);
        });

        it('does not warn when proper classes are used', () => {
            toMcpToolResult(new TextContent('x'));
            toMcpToolResult(new McpToolResponse({ content: [new TextContent('x')] }));
            toMcpToolResult([new TextContent('a'), new TextContent('b')]);
            expect(warnStub.notCalled).to.equal(true);
        });

        it('does not change behavior when warning fires (still serializes as plain text)', () => {
            const result = toMcpToolResult({ type: 'text', text: 'x' });
            expect(result?.type).to.equal('text');
            const content = JSON.parse(result?.content || '{}') as { type: string; text: string };
            expect(JSON.parse(content.text)).to.deep.equal({ type: 'text', text: 'x' });
        });
    });
});
