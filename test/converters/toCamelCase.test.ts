// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import 'mocha';
import { toCamelCaseValue } from '../../src/converters/toCamelCase';

describe('toCamelCaseValue', () => {
    it('false-y values', () => {
        const testData = {
            Zero: 0,
            False: false,
            Null: null,
            Undefined: undefined,
            EMPTY: '',
        };

        expect(toCamelCaseValue(testData)).to.deep.equal({
            zero: 0,
            false: false,
            null: null,
            undefined: undefined,
            eMPTY: '',
        });
    });

    it('array', () => {
        const testData = [{ A: 1 }, { B: 2 }];
        expect(toCamelCaseValue(testData)).to.deep.equal([{ a: 1 }, { b: 2 }]);
    });

    it('nested object', () => {
        const testData = { A: { B: { C: { D: 1 } } } };
        expect(toCamelCaseValue(testData)).to.deep.equal({ a: { b: { c: { d: 1 } } } });
    });
});
