// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import { fromString } from 'long';
import 'mocha';
import { fromRpcTypedData } from '../../src/converters/fromRpcTypedData';

describe('fromRpcTypedData', () => {
    it('string', () => {
        const data = fromRpcTypedData({ string: 'foo' });
        expect(data).to.equal('foo');
    });

    it('json', () => {
        const data = fromRpcTypedData({ json: '{ "foo": "bar" }' });
        expect(data && data['foo']).to.equal('bar');
    });

    it('byte', () => {
        const buffer = Buffer.from('hello');
        const data = fromRpcTypedData({ bytes: buffer });
        expect(data && data['buffer']).to.equal(buffer.buffer);
    });

    it('collectionBytes', () => {
        const fooBuffer = Buffer.from('foo');
        const barBuffer = Buffer.from('bar');
        const data = fromRpcTypedData({ collectionBytes: { bytes: [fooBuffer, barBuffer] } });
        expect(data && data[0] && data[0]['buffer']).to.equal(fooBuffer.buffer);
        expect(data && data[1] && data[1]['buffer']).to.equal(barBuffer.buffer);
    });

    it('collectionString', () => {
        const data = fromRpcTypedData({ collectionString: { string: ['foo', 'bar'] } });
        expect(data && data[0]).to.equal('foo');
        expect(data && data[1]).to.equal('bar');
    });

    it('collectionDouble', () => {
        const data = fromRpcTypedData({ collectionDouble: { double: [1.1, 2.2] } });
        expect(data && data[0]).to.equal(1.1);
        expect(data && data[1]).to.equal(2.2);
    });

    it('collectionSint64', () => {
        const data = fromRpcTypedData({ collectionSint64: { sint64: [123, fromString('9007199254740992')] } });
        expect(data && data[0]).to.equal(123);
        expect(data && data[1]).to.equal('9007199254740992');
    });
});
