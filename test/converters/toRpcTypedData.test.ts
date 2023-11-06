// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { toRpcTypedData } from '../../src/converters/toRpcTypedData';

describe('toRpcTypedData', () => {
    it('undefined', () => {
        expect(toRpcTypedData(undefined)).to.be.undefined;
    });

    it('null', () => {
        expect(toRpcTypedData(null)).to.be.null;
    });

    it('string', () => {
        expect(toRpcTypedData('test')).to.deep.equal({ string: 'test' });
    });

    it('buffer', () => {
        expect(toRpcTypedData(Buffer.from('test'))).to.deep.equal({ bytes: Buffer.from('test') });
    });

    it('array buffer', () => {
        expect(toRpcTypedData(new DataView(new ArrayBuffer(4)))).to.deep.equal({ bytes: new Uint8Array(4) });
    });

    it('int', () => {
        expect(toRpcTypedData(3)).to.deep.equal({ int: 3 });
    });

    it('double', () => {
        expect(toRpcTypedData(3.4)).to.deep.equal({ double: 3.4 });
    });

    it('json object', () => {
        expect(toRpcTypedData({ a: 'b' })).to.deep.equal({ json: '{"a":"b"}' });
    });

    it('json array', () => {
        expect(toRpcTypedData([{ a: 'b' }])).to.deep.equal({ json: '[{"a":"b"}]' });
    });

    it('json boolean', () => {
        expect(toRpcTypedData(true)).to.deep.equal({ json: 'true' });
    });

    it('function', () => {
        expect(
            toRpcTypedData(() => {
                console.log('hello');
            })
        ).to.deep.equal({ json: undefined });
    });
});
