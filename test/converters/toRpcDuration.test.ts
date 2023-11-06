// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { toRpcDuration } from '../../src/converters/toRpcDuration';

describe('toRpcDuration', () => {
    it('number', () => {
        const value = toRpcDuration(5000, 'test');
        expect(value).to.deep.equal({ seconds: 5 });
    });

    it('zero', () => {
        const value = toRpcDuration(0, 'test');
        expect(value).to.deep.equal({ seconds: 0 });
    });

    it('milliseconds', () => {
        const value = toRpcDuration({ milliseconds: 6000 }, 'test');
        expect(value).to.deep.equal({ seconds: 6 });
    });

    it('seconds', () => {
        const value = toRpcDuration({ seconds: 7 }, 'test');
        expect(value).to.deep.equal({ seconds: 7 });
    });

    it('minutes', () => {
        const value = toRpcDuration({ minutes: 3 }, 'test');
        expect(value).to.deep.equal({ seconds: 180 });
    });

    it('hours', () => {
        const value = toRpcDuration({ hours: 2 }, 'test');
        expect(value).to.deep.equal({ seconds: 7200 });
    });

    it('combined', () => {
        const value = toRpcDuration({ hours: 1, minutes: 1, seconds: 1, milliseconds: 1000 }, 'test');
        expect(value).to.deep.equal({ seconds: 3662 });
    });

    it('throws and does not convert string', () => {
        expect(() => {
            toRpcDuration(<any>'invalid', 'test');
        }).to.throw(
            "A 'number' or 'Duration' object was expected instead of a 'string'. Cannot parse value of 'test'."
        );
    });

    it('does not convert null', () => {
        const value = toRpcDuration(<any>null, 'test');
        expect(value).to.be.undefined;
    });
});
