// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import 'mocha';
import {
    toNullableBool,
    toNullableDouble,
    toNullableString,
    toNullableTimestamp,
} from '../../src/converters/toRpcNullable';

describe('toRpcNullable', () => {
    describe('toNullableBool', () => {
        it('true', () => {
            const nullable = toNullableBool(true, 'test');
            expect(nullable && nullable.value).to.equal(true);
        });

        it('false', () => {
            const nullable = toNullableBool(false, 'test');
            expect(nullable && nullable.value).to.equal(false);
        });

        it('throws and does not convert string', () => {
            expect(() => {
                toNullableBool(<any>'true', 'test');
            }).to.throw("A 'boolean' type was expected instead of a 'string' type. Cannot parse value of 'test'.");
        });

        it('does not convert null', () => {
            const nullable = toNullableBool(<any>null, 'test');
            expect(nullable && nullable.value).to.be.undefined;
        });
    });

    describe('toNullableString', () => {
        it('string', () => {
            const input = 'hello';
            const nullable = toNullableString(input, 'test');
            expect(nullable && nullable.value).to.equal(input);
        });

        it('empty string', () => {
            const input = '';
            const nullable = toNullableString(input, 'test');
            expect(nullable && nullable.value).to.equal(input);
        });

        it('throws and does not convert number', () => {
            expect(() => {
                toNullableString(<any>123, 'test');
            }).to.throw("A 'string' type was expected instead of a 'number' type. Cannot parse value of 'test'.");
        });

        it('does not convert null', () => {
            const nullable = toNullableString(<any>null, 'test');
            expect(nullable && nullable.value).to.be.undefined;
        });
    });

    describe('toNullableDouble', () => {
        it('number', () => {
            const input = 1234567;
            const nullable = toNullableDouble(input, 'test');
            expect(nullable && nullable.value).to.equal(input);
        });

        it('0', () => {
            const input = 0;
            const nullable = toNullableDouble(input, 'test');
            expect(nullable && nullable.value).to.equal(input);
        });

        it('negative number', () => {
            const input = -11234567;
            const nullable = toNullableDouble(input, 'test');
            expect(nullable && nullable.value).to.equal(input);
        });

        it('numeric string', () => {
            const input = '1234567';
            const nullable = toNullableDouble(input, 'test');
            expect(nullable && nullable.value).to.equal(1234567);
        });

        it('float string', () => {
            const input = '1234567.002';
            const nullable = toNullableDouble(input, 'test');
            expect(nullable && nullable.value).to.equal(1234567.002);
        });

        it('throws and does not convert non-number string', () => {
            expect(() => {
                toNullableDouble(<any>'123hellohello!!111', 'test');
            }).to.throw("A 'number' type was expected instead of a 'string' type. Cannot parse value of 'test'.");
        });

        it('does not convert undefined', () => {
            const nullable = toNullableDouble(undefined, 'test');
            expect(nullable && nullable.value).to.be.undefined;
        });
    });

    describe('toNullableTimestamp', () => {
        it('Date', () => {
            const input = new Date('1/2/2014');
            const nullable = toNullableTimestamp(input, 'test');
            const secondInput = Math.round((<any>input).getTime() / 1000);
            expect(nullable && nullable.value && nullable.value.seconds).to.equal(secondInput);
        });

        it('Date.now', () => {
            const input = Date.now();
            const nullable = toNullableTimestamp(input, 'test');
            const secondInput = Math.round(input / 1000);
            expect(nullable && nullable.value && nullable.value.seconds).to.equal(secondInput);
        });

        it('milliseconds', () => {
            const input = Date.now();
            const nullable = toNullableTimestamp(input, 'test');
            const secondInput = Math.round(input / 1000);
            expect(nullable && nullable.value && nullable.value.seconds).to.equal(secondInput);
        });

        it('does not convert string', () => {
            expect(() => {
                toNullableTimestamp(<any>'1/2/3 2014', 'test');
            }).to.throw("A 'number' or 'Date' input was expected instead of a 'string'. Cannot parse value of 'test'.");
        });

        it('does not convert object', () => {
            expect(() => {
                toNullableTimestamp(<any>{ time: 100 }, 'test');
            }).to.throw("A 'number' or 'Date' input was expected instead of a 'object'. Cannot parse value of 'test'.");
        });

        it('does not convert undefined', () => {
            const nullable = toNullableTimestamp(undefined, 'test');
            expect(nullable && nullable.value).to.be.undefined;
        });
    });
});
