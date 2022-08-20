// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import 'mocha';
import { Headers } from 'undici';
import { toRpcHttp } from '../../src/converters/toRpcHttp';

describe('toRpcHttp', () => {
    it('undefined', () => {
        const result = toRpcHttp({});
        expect(result?.http?.statusCode).to.be.undefined;
        expect(result?.http?.body).to.be.undefined;
        expect(result?.http?.headers).to.deep.equal({});
        expect(result?.http?.cookies).to.deep.equal([]);
    });

    it('null', () => {
        const result = toRpcHttp({
            body: null,
            status: null,
            headers: null,
            cookies: null,
        });
        expect(result?.http?.statusCode).to.be.undefined;
        expect(result?.http?.body).to.be.null;
        expect(result?.http?.headers).to.deep.equal({});
        expect(result?.http?.cookies).to.deep.equal([]);
    });

    it('array (weird, but still valid)', () => {
        expect(toRpcHttp(Object.assign([], { body: 'a' }))?.http?.body).to.deep.equal({ string: 'a' });
    });

    it('invalid data string', () => {
        expect(() => {
            toRpcHttp('invalid');
        }).to.throw(/must be an object/i);
    });

    it('invalid data boolean', () => {
        expect(() => {
            toRpcHttp(true);
        }).to.throw(/must be an object/i);
    });

    it('body buffer', () => {
        expect(toRpcHttp({ body: Buffer.from('b') })?.http?.body).to.deep.equal({ bytes: Buffer.from('b') });
    });

    it('body number', () => {
        expect(toRpcHttp({ body: 3 })?.http?.body).to.deep.equal({ int: 3 });
    });

    it('status number', () => {
        expect(toRpcHttp({ status: 200 })?.http?.statusCode).to.equal('200');
    });

    it('status string', () => {
        expect(toRpcHttp({ status: '500' })?.http?.statusCode).to.equal('500');
    });

    it('status invalid', () => {
        expect(() => toRpcHttp({ status: {} })).to.throw(/status.*number.*string/i);
    });

    it('headers object', () => {
        expect(
            toRpcHttp({
                headers: {
                    a: 'b',
                },
            })?.http?.headers?.a
        ).to.equal('b');
    });

    it('headers array', () => {
        expect(
            toRpcHttp({
                headers: [['c', 'd']],
            })?.http?.headers?.c
        ).to.equal('d');
    });

    it('headers class', () => {
        expect(
            toRpcHttp({
                headers: new Headers({
                    e: 'f',
                }),
            })?.http?.headers?.e
        ).to.equal('f');
    });

    it('headers invalid', () => {
        expect(() =>
            toRpcHttp({
                headers: true,
            })
        ).to.throw(/argument.*could not be converted/i);
    });
});
