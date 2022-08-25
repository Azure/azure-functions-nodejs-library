// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import 'mocha';
import { fromRpcRetryContext, fromRpcTraceContext } from '../../src/converters/fromRpcContext';

describe('fromRpcContext', () => {
    describe('fromRpcTraceContext', () => {
        it('Copies defined values', () => {
            const traceContext = fromRpcTraceContext({
                traceParent: 'testParent',
                traceState: 'testState',
                attributes: { a: 'b' },
            });
            expect(traceContext?.traceParent).to.equal('testParent');
            expect(traceContext?.traceState).to.equal('testState');
            expect(traceContext?.attributes).to.deep.equal({ a: 'b' });
        });

        it('Converts null to undefined', () => {
            const traceContext = fromRpcTraceContext({
                traceParent: null,
                traceState: null,
                attributes: null,
            });
            expect(traceContext?.attributes).to.be.undefined;
            expect(traceContext?.traceParent).to.be.undefined;
            expect(traceContext?.traceState).to.be.undefined;
        });

        it('Leaves undefined as-is', () => {
            const traceContext = fromRpcTraceContext({
                traceParent: undefined,
                traceState: undefined,
                attributes: undefined,
            });
            expect(traceContext?.attributes).to.be.undefined;
            expect(traceContext?.traceParent).to.be.undefined;
            expect(traceContext?.traceState).to.be.undefined;
        });
    });

    describe('fromRpcRetryContext', () => {
        it('Copies defined values', () => {
            const traceContext = fromRpcRetryContext({
                retryCount: 1,
                maxRetryCount: 2,
                exception: undefined,
            });
            expect(traceContext?.retryCount).to.equal(1);
            expect(traceContext?.maxRetryCount).to.equal(2);
            expect(traceContext?.exception).to.be.undefined;
        });

        it('Copies defined values with exception', () => {
            const traceContext = fromRpcRetryContext({
                retryCount: 1,
                maxRetryCount: 2,
                exception: {
                    message: '1',
                    source: '2',
                    stackTrace: '3',
                },
            });
            expect(traceContext?.retryCount).to.equal(1);
            expect(traceContext?.maxRetryCount).to.equal(2);
            expect(traceContext?.exception).to.deep.equal({
                message: '1',
                source: '2',
                stackTrace: '3',
            });
        });

        it('Errors for expected properties', () => {
            expect(() =>
                fromRpcRetryContext({
                    retryCount: 1,
                    maxRetryCount: undefined,
                })
            ).to.throw(/internal error/i);

            expect(() =>
                fromRpcRetryContext({
                    retryCount: null,
                    maxRetryCount: 2,
                })
            ).to.throw(/internal error/i);
        });
    });
});
