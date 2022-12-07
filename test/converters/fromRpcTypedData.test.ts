// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import { fromString } from 'long';
import 'mocha';
import { HttpRequest } from '../../src';
import { fromRpcTypedData } from '../../src/converters/fromRpcTypedData';
import Long = require('long');

describe('fromRpcTypedData', () => {
    it('null', () => {
        expect(fromRpcTypedData(null)).to.be.undefined;
        expect(fromRpcTypedData(undefined)).to.be.undefined;
    });

    it('string', () => {
        expect(fromRpcTypedData({ string: 'test' })).to.equal('test');
        expect(fromRpcTypedData({ string: '{ "a": "b" }' })).to.deep.equal({ a: 'b' });
        expect(fromRpcTypedData({ string: '{ "a": "b" ' })).to.equal('{ "a": "b" ');
        expect(fromRpcTypedData({ string: '[1,2]' })).to.deep.equal([1, 2]);
        expect(fromRpcTypedData({ string: 'true' })).to.equal(true);
        expect(fromRpcTypedData({ string: 'false' })).to.equal(false);
        expect(fromRpcTypedData({ string: '1' })).to.equal(1);
        expect(fromRpcTypedData({ string: '0' })).to.equal(0);
    });

    it('json', () => {
        expect(fromRpcTypedData({ json: '{ "a": "b" }' })).to.deep.equal({ a: 'b' });
        expect(fromRpcTypedData({ json: '[1,2]' })).to.deep.equal([1, 2]);
        expect(fromRpcTypedData({ json: 'true' })).to.be.true;
        expect(fromRpcTypedData({ json: 'false' })).to.be.false;
        expect(fromRpcTypedData({ json: '1' })).to.equal(1);
        expect(fromRpcTypedData({ json: '0' })).to.equal(0);
        expect(() => fromRpcTypedData({ json: '{ "a": "b" ' })).to.throw(/json/i);
    });

    it('bytes', () => {
        const result: any = fromRpcTypedData({ bytes: new Uint8Array([116, 101, 115, 116]) });
        expect(result).to.be.instanceOf(Buffer);
        expect(result.toString()).to.equal('test');
    });

    it('stream', () => {
        const result: any = fromRpcTypedData({ stream: new Uint8Array([116, 101, 115, 116]) });
        expect(result).to.be.instanceOf(Buffer);
        expect(result.toString()).to.equal('test');
    });

    it('http', async () => {
        const result: any = fromRpcTypedData({
            http: {
                method: 'POST',
                body: {
                    bytes: new Uint8Array([116, 101, 115, 116]),
                },
                url: 'http://microsoft.com',
            },
        });
        expect(result).to.be.instanceOf(HttpRequest);
        expect(await result.text()).to.equal('test');
        expect(result.url).to.equal('http://microsoft.com/');
    });

    it('int', () => {
        expect(fromRpcTypedData({ int: 1 })).to.equal(1);
        expect(fromRpcTypedData({ int: 0 })).to.equal(0);
    });

    it('double', () => {
        expect(fromRpcTypedData({ double: 1 })).to.equal(1);
        expect(fromRpcTypedData({ double: 1.3 })).to.equal(1.3);
        expect(fromRpcTypedData({ double: 0 })).to.equal(0);
    });

    it('collectionBytes', () => {
        const test1 = new Uint8Array([116, 101, 115, 116, 49]);
        const test2 = new Uint8Array([116, 101, 115, 116, 50]);
        const result: any = fromRpcTypedData({ collectionBytes: { bytes: [test1, test2] } });
        expect(result[0]).to.be.instanceOf(Buffer);
        expect(result[0].toString()).to.equal('test1');
        expect(result[1]).to.be.instanceOf(Buffer);
        expect(result[1].toString()).to.equal('test2');
    });

    it('collectionString', () => {
        expect(fromRpcTypedData({ collectionString: { string: ['test1', 'test2'] } })).to.deep.equal([
            'test1',
            'test2',
        ]);
        expect(fromRpcTypedData({ collectionString: { string: ['{"a": "b"}', 'test2'] } })).to.deep.equal([
            { a: 'b' },
            'test2',
        ]);
        expect(fromRpcTypedData({ collectionString: { string: ['{"a": "b"', 'test2'] } })).to.deep.equal([
            '{"a": "b"',
            'test2',
        ]);
    });

    it('collectionDouble', () => {
        const result: any = fromRpcTypedData({ collectionDouble: { double: [1.1, 2.2] } });
        expect(result).to.deep.equal([1.1, 2.2]);
    });

    it('collectionSint64', () => {
        const result: any = fromRpcTypedData({ collectionSint64: { sint64: [123, fromString('9007199254740992')] } });
        expect(result[0]).to.equal(123);
        expect(result[1]).to.be.instanceOf(Long);
        expect(result[1].toString()).to.equal('9007199254740992');
    });
});
