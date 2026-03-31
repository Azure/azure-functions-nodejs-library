// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { toMcpToolResult } from '../../src/converters/toMcpToolResult';

describe('toMcpToolResult', () => {
    it('wraps primitive string as text content', () => {
        const result = toMcpToolResult('hello');

        expect(result).to.deep.equal({
            type: 'text',
            content: JSON.stringify({ type: 'text', text: 'hello' }),
        });
    });

    it('creates structuredContent for plain object', () => {
        const payload = { status: 'ok', count: 2 };
        const result = toMcpToolResult(payload);

        expect(result?.type).to.equal('text');
        expect(result?.structuredContent).to.equal(JSON.stringify(payload));

        const content = JSON.parse(result?.content || '{}') as { type: string; text: string };
        expect(content.type).to.equal('text');
        expect(content.text).to.equal(JSON.stringify(payload));
    });

    it('does not create structuredContent for arrays', () => {
        const result = toMcpToolResult([1, 2, 3]);

        expect(result?.type).to.equal('text');
        expect(result?.structuredContent).to.equal(undefined);
    });

    it('passes through existing mcp result', () => {
        const existing = {
            type: 'text',
            content: JSON.stringify({ type: 'text', text: 'existing' }),
            structuredContent: JSON.stringify({ source: 'existing' }),
        };

        const result = toMcpToolResult(existing);
        expect(result).to.equal(existing);
    });

    it('wraps call tool result and propagates structuredContent', () => {
        const structured = { op: 'calc', result: 42 };
        const callToolResult = {
            content: [{ type: 'text', text: 'Calculation completed' }],
            structuredContent: structured,
        };

        const result = toMcpToolResult(callToolResult);
        expect(result).to.deep.equal({
            type: 'call_tool_result',
            content: JSON.stringify(callToolResult),
            structuredContent: JSON.stringify(structured),
        });
    });
});
