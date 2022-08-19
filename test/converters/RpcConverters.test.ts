// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import { fromString } from 'long';
import 'mocha';
import {
    fromRpcRetryContext,
    fromRpcTraceContext,
    fromTypedData,
    toNullableBool,
    toNullableDouble,
    toNullableString,
    toNullableTimestamp,
} from '../../src/converters/RpcConverters';

describe('Rpc Converters', () => {
    describe('fromTypedData', () => {
        it('deserializes string data with fromTypedData', () => {
            const data = fromTypedData({ string: 'foo' });
            expect(data).to.equal('foo');
        });

        it('deserializes json data with fromTypedData', () => {
            const data = fromTypedData({ json: '{ "foo": "bar" }' });
            expect(data && data['foo']).to.equal('bar');
        });

        it('deserializes byte data with fromTypedData', () => {
            const buffer = Buffer.from('hello');
            const data = fromTypedData({ bytes: buffer });
            expect(data && data['buffer']).to.equal(buffer.buffer);
        });

        it('deserializes collectionBytes data with fromTypedData', () => {
            const fooBuffer = Buffer.from('foo');
            const barBuffer = Buffer.from('bar');
            const data = fromTypedData({ collectionBytes: { bytes: [fooBuffer, barBuffer] } });
            expect(data && data[0] && data[0]['buffer']).to.equal(fooBuffer.buffer);
            expect(data && data[1] && data[1]['buffer']).to.equal(barBuffer.buffer);
        });

        it('deserializes collectionString data with fromTypedData', () => {
            const data = fromTypedData({ collectionString: { string: ['foo', 'bar'] } });
            expect(data && data[0]).to.equal('foo');
            expect(data && data[1]).to.equal('bar');
        });

        it('deserializes collectionDouble data with fromTypedData', () => {
            const data = fromTypedData({ collectionDouble: { double: [1.1, 2.2] } });
            expect(data && data[0]).to.equal(1.1);
            expect(data && data[1]).to.equal(2.2);
        });

        it('deserializes collectionSint64 data with fromTypedData', () => {
            const data = fromTypedData({ collectionSint64: { sint64: [123, fromString('9007199254740992')] } });
            expect(data && data[0]).to.equal(123);
            expect(data && data[1]).to.equal('9007199254740992');
        });
    });

    describe('fromRpcTraceContext', () => {
        it('Copies defined values', () => {
            const traceContext = fromRpcTraceContext({
                traceParent: 'testParent',
                traceState: 'testState',
                attributes: { a: 'b' },
            });
            expect(traceContext.traceParent).to.equal('testParent');
            expect(traceContext.traceState).to.equal('testState');
            expect(traceContext.attributes).to.deep.equal({ a: 'b' });
        });

        it('Converts null to undefined', () => {
            const traceContext = fromRpcTraceContext({
                traceParent: null,
                traceState: null,
                attributes: null,
            });
            expect(traceContext.attributes).to.be.undefined;
            expect(traceContext.traceParent).to.be.undefined;
            expect(traceContext.traceState).to.be.undefined;
        });

        it('Leaves undefined as-is', () => {
            const traceContext = fromRpcTraceContext({
                traceParent: undefined,
                traceState: undefined,
                attributes: undefined,
            });
            expect(traceContext.attributes).to.be.undefined;
            expect(traceContext.traceParent).to.be.undefined;
            expect(traceContext.traceState).to.be.undefined;
        });
    });

    describe('fromRpcRetryContext', () => {
        it('Copies defined values', () => {
            const traceContext = fromRpcRetryContext({
                retryCount: 1,
                maxRetryCount: 2,
                exception: undefined,
            });
            expect(traceContext.retryCount).to.equal(1);
            expect(traceContext.maxRetryCount).to.equal(2);
            expect(traceContext.exception).to.be.undefined;
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
            expect(traceContext.retryCount).to.equal(1);
            expect(traceContext.maxRetryCount).to.equal(2);
            expect(traceContext.exception).to.deep.equal({
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

    describe('toNullableBool', () => {
        it('converts true to NullableBool', () => {
            const nullable = toNullableBool(true, 'test');
            expect(nullable && nullable.value).to.equal(true);
        });

        it('converts false to NullableBool', () => {
            const nullable = toNullableBool(false, 'test');
            expect(nullable && nullable.value).to.equal(false);
        });

        it('throws and does not converts string to NullableBool', () => {
            expect(() => {
                toNullableBool(<any>'true', 'test');
            }).to.throw("A 'boolean' type was expected instead of a 'string' type. Cannot parse value of 'test'.");
        });

        it('does not converts null to NullableBool', () => {
            const nullable = toNullableBool(<any>null, 'test');
            expect(nullable && nullable.value).to.be.undefined;
        });
    });

    describe('toNullableString', () => {
        it('converts string to NullableString', () => {
            const input = 'hello';
            const nullable = toNullableString(input, 'test');
            expect(nullable && nullable.value).to.equal(input);
        });

        it('converts empty string to NullableString', () => {
            const input = '';
            const nullable = toNullableString(input, 'test');
            expect(nullable && nullable.value).to.equal(input);
        });

        it('throws and does not convert number to NullableString', () => {
            expect(() => {
                toNullableString(<any>123, 'test');
            }).to.throw("A 'string' type was expected instead of a 'number' type. Cannot parse value of 'test'.");
        });

        it('does not convert null to NullableString', () => {
            const nullable = toNullableString(<any>null, 'test');
            expect(nullable && nullable.value).to.be.undefined;
        });
    });

    describe('toNullableDouble', () => {
        it('converts number to NullableDouble', () => {
            const input = 1234567;
            const nullable = toNullableDouble(input, 'test');
            expect(nullable && nullable.value).to.equal(input);
        });

        it('converts 0 to NullableDouble', () => {
            const input = 0;
            const nullable = toNullableDouble(input, 'test');
            expect(nullable && nullable.value).to.equal(input);
        });

        it('converts negative number to NullableDouble', () => {
            const input = -11234567;
            const nullable = toNullableDouble(input, 'test');
            expect(nullable && nullable.value).to.equal(input);
        });

        it('converts numeric string to NullableDouble', () => {
            const input = '1234567';
            const nullable = toNullableDouble(input, 'test');
            expect(nullable && nullable.value).to.equal(1234567);
        });

        it('converts float string to NullableDouble', () => {
            const input = '1234567.002';
            const nullable = toNullableDouble(input, 'test');
            expect(nullable && nullable.value).to.equal(1234567.002);
        });

        it('throws and does not convert non-number string to NullableDouble', () => {
            expect(() => {
                toNullableDouble(<any>'123hellohello!!111', 'test');
            }).to.throw("A 'number' type was expected instead of a 'string' type. Cannot parse value of 'test'.");
        });

        it('does not convert undefined to NullableDouble', () => {
            const nullable = toNullableDouble(undefined, 'test');
            expect(nullable && nullable.value).to.be.undefined;
        });
    });

    describe('toNullableTimestamp', () => {
        it('converts Date to NullableTimestamp', () => {
            const input = new Date('1/2/2014');
            const nullable = toNullableTimestamp(input, 'test');
            const secondInput = Math.round((<any>input).getTime() / 1000);
            expect(nullable && nullable.value && nullable.value.seconds).to.equal(secondInput);
        });

        it('converts Date.now to NullableTimestamp', () => {
            const input = Date.now();
            const nullable = toNullableTimestamp(input, 'test');
            const secondInput = Math.round(input / 1000);
            expect(nullable && nullable.value && nullable.value.seconds).to.equal(secondInput);
        });

        it('converts milliseconds to NullableTimestamp', () => {
            const input = Date.now();
            const nullable = toNullableTimestamp(input, 'test');
            const secondInput = Math.round(input / 1000);
            expect(nullable && nullable.value && nullable.value.seconds).to.equal(secondInput);
        });

        it('does not convert string to NullableTimestamp', () => {
            expect(() => {
                toNullableTimestamp(<any>'1/2/3 2014', 'test');
            }).to.throw("A 'number' or 'Date' input was expected instead of a 'string'. Cannot parse value of 'test'.");
        });

        it('does not convert object to NullableTimestamp', () => {
            expect(() => {
                toNullableTimestamp(<any>{ time: 100 }, 'test');
            }).to.throw("A 'number' or 'Date' input was expected instead of a 'object'. Cannot parse value of 'test'.");
        });

        it('does not convert undefined to NullableTimestamp', () => {
            const nullable = toNullableTimestamp(undefined, 'test');
            expect(nullable && nullable.value).to.be.undefined;
        });
    });
});
