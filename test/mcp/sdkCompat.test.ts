// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import type { InvocationContext } from '@azure/functions';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { toMcpToolResult } from '../../src/converters/toMcpToolResult';
import { McpTextContent, McpToolResponse } from '../../src/mcp/McpToolResponse';
import { __resetMcpSdkWarning } from '../../src/mcp/sdkCompat';

describe('MCP SDK compat', () => {
    let warnStub: sinon.SinonStub;
    let context: InvocationContext;

    beforeEach(() => {
        __resetMcpSdkWarning();
        warnStub = sinon.stub();
        context = { warn: warnStub } as unknown as InvocationContext;
    });

    afterEach(() => {
        __resetMcpSdkWarning();
    });

    describe('one-time warning on SDK-shaped values', () => {
        it('warns via the supplied logger when value has a content array', () => {
            toMcpToolResult({ content: [{ type: 'text', text: 'x' }] }, context);
            expect(warnStub.calledOnce).to.equal(true);
            expect(warnStub.firstCall.args[0]).to.match(/@modelcontextprotocol\/sdk/);
        });

        it('warns when value has type + text/data/uri/resource', () => {
            toMcpToolResult({ type: 'text', text: 'x' }, context);
            expect(warnStub.calledOnce).to.equal(true);
        });

        it('does not warn for unrelated plain values', () => {
            toMcpToolResult({ id: 'plain' }, context);
            toMcpToolResult('hello', context);
            toMcpToolResult(42, context);
            expect(warnStub.notCalled).to.equal(true);
        });

        it('only warns once across multiple invocations', () => {
            toMcpToolResult({ content: [{ type: 'text', text: 'x' }] }, context);
            toMcpToolResult({ type: 'text', text: 'y' }, context);
            toMcpToolResult({ content: [] }, context);
            expect(warnStub.callCount).to.equal(1);
        });

        it('does not warn when proper classes are used', () => {
            toMcpToolResult(new McpTextContent('x'), context);
            toMcpToolResult(new McpToolResponse({ content: [new McpTextContent('x')] }), context);
            toMcpToolResult([new McpTextContent('a'), new McpTextContent('b')], context);
            expect(warnStub.notCalled).to.equal(true);
        });

        it('does not warn when no logger is supplied, even for SDK-shaped values', () => {
            const consoleWarn = sinon.stub(console, 'warn');
            try {
                toMcpToolResult({ content: [{ type: 'text', text: 'x' }] });
                expect(consoleWarn.notCalled).to.equal(true);
            } finally {
                consoleWarn.restore();
            }
        });

        it('does not change behavior when warning fires (still serializes as plain text)', () => {
            const result = toMcpToolResult({ type: 'text', text: 'x' }, context);
            expect(result?.type).to.equal('text');
            const content = JSON.parse(result?.content || '{}') as { type: string; text: string };
            expect(JSON.parse(content.text)).to.deep.equal({ type: 'text', text: 'x' });
        });
    });
});
