// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { PromptInvocationContext } from '../../src/mcp/PromptInvocationContext';

describe('PromptInvocationContext', () => {
    it('parses a full payload object', () => {
        const ctx = new PromptInvocationContext({
            name: 'code_review',
            arguments: { code: 'console.log("hello")', language: 'typescript' },
            sessionId: 'session-123',
            transport: { name: 'http' },
        });
        expect(ctx.name).to.equal('code_review');
        expect(ctx.arguments).to.deep.equal({ code: 'console.log("hello")', language: 'typescript' });
        expect(ctx.sessionId).to.equal('session-123');
        expect(ctx.transport).to.deep.equal({ name: 'http' });
    });

    it('parses a JSON string payload', () => {
        const ctx = new PromptInvocationContext(
            JSON.stringify({ name: 'summarize', arguments: { text: 'hi' } })
        );
        expect(ctx.name).to.equal('summarize');
        expect(ctx.arguments).to.deep.equal({ text: 'hi' });
        expect(ctx.sessionId).to.equal(undefined);
        expect(ctx.transport).to.equal(undefined);
    });

    it('accepts lowercase "sessionid" key', () => {
        const ctx = new PromptInvocationContext({ name: 'p', sessionid: 'abc' });
        expect(ctx.sessionId).to.equal('abc');
    });

    it('returns defaults for empty object', () => {
        const ctx = new PromptInvocationContext({});
        expect(ctx.name).to.equal('');
        expect(ctx.arguments).to.deep.equal({});
        expect(ctx.sessionId).to.equal(undefined);
        expect(ctx.transport).to.equal(undefined);
    });

    it('returns defaults for invalid JSON string', () => {
        const ctx = new PromptInvocationContext('not json');
        expect(ctx.name).to.equal('');
        expect(ctx.arguments).to.deep.equal({});
    });

    it('coerces non-string argument values to strings', () => {
        const ctx = new PromptInvocationContext({
            name: 'p',
            arguments: { count: 3, flag: true, missing: null },
        });
        expect(ctx.arguments).to.deep.equal({ count: '3', flag: 'true', missing: '' });
    });

    it('ignores non-object arguments field', () => {
        const ctx = new PromptInvocationContext({ name: 'p', arguments: 'not-an-object' });
        expect(ctx.arguments).to.deep.equal({});
    });

    it('ignores non-object transport field', () => {
        const ctx = new PromptInvocationContext({ name: 'p', transport: 'http' });
        expect(ctx.transport).to.equal(undefined);
    });

    it('handles null/undefined input', () => {
        expect(new PromptInvocationContext(null).name).to.equal('');
        expect(new PromptInvocationContext(undefined).name).to.equal('');
    });
});
