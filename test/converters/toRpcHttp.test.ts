// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Headers } from 'undici';
import { toRpcHttp } from '../../src/converters/toRpcHttp';
import { HttpResponse } from '../../src/http/HttpResponse';

chai.use(chaiAsPromised);

describe('toRpcHttp', () => {
    const textPlainHeaders = { 'content-type': 'text/plain;charset=UTF-8' };
    const jsonHeaders = { 'content-type': 'application/json' };
    function getExpectedRpcHttp(body: string, headers: Record<string, string>, statusCode = '200') {
        return {
            http: {
                statusCode,
                body: {
                    bytes: Buffer.from(body),
                },
                headers: headers,
                enableContentNegotiation: false,
                cookies: [],
            },
        };
    }

    it('hello world', async () => {
        const result = await toRpcHttp({ body: 'hello world' });
        expect(result).to.deep.equal(getExpectedRpcHttp('hello world', textPlainHeaders));
    });

    it('response class hello world', async () => {
        const result = await toRpcHttp(new HttpResponse({ body: 'hello world' }));
        expect(result).to.deep.equal(getExpectedRpcHttp('hello world', textPlainHeaders));
    });

    it('response class json', async () => {
        const result = await toRpcHttp(new HttpResponse({ jsonBody: { hello: 'world' } }));
        expect(result).to.deep.equal(getExpectedRpcHttp('{"hello":"world"}', jsonHeaders));
    });

    it('response class json manual json', async () => {
        const req = new HttpResponse({ body: '{ "hello":  "world" }' });
        req.headers.set('content-type', 'application/json');
        const result = await toRpcHttp(req);
        expect(result).to.deep.equal(
            getExpectedRpcHttp('{ "hello":  "world" }', {
                'content-type': 'application/json',
            })
        );
    });

    it('undefined', async () => {
        const result = await toRpcHttp({});
        expect(result).to.deep.equal(getExpectedRpcHttp('', {}));
    });

    it('array (weird, but still valid)', async () => {
        const result = await toRpcHttp(Object.assign([], { body: 'a' }));
        expect(result).to.deep.equal(getExpectedRpcHttp('a', textPlainHeaders));
    });

    it('invalid data string', async () => {
        await expect(toRpcHttp('invalid')).to.eventually.be.rejectedWith(/must be an object/i);
    });

    it('invalid data boolean', async () => {
        await expect(toRpcHttp(true)).to.eventually.be.rejectedWith(/must be an object/i);
    });

    it('body buffer', async () => {
        const result = await toRpcHttp({ body: Buffer.from('b') });
        expect(result).to.deep.equal(getExpectedRpcHttp('b', {}));
    });

    it('body number', async () => {
        const result = await toRpcHttp({ body: 3 });
        expect(result).to.deep.equal(getExpectedRpcHttp('3', textPlainHeaders));
    });

    it('status number', async () => {
        const result = await toRpcHttp({ status: 400 });
        expect(result).to.deep.equal(getExpectedRpcHttp('', {}, '400'));
    });

    it('status string', async () => {
        const result = await toRpcHttp({ status: '500' });
        expect(result).to.deep.equal(getExpectedRpcHttp('', {}, '500'));
    });

    it('status invalid', async () => {
        await expect(toRpcHttp({ status: {} })).to.eventually.be.rejectedWith(/status/i);
    });

    it('headers object', async () => {
        const result = await toRpcHttp({
            headers: {
                a: 'b',
            },
        });
        expect(result?.http?.headers?.a).to.equal('b');
    });

    it('headers array', async () => {
        const result = await toRpcHttp({
            headers: [['c', 'd']],
        });
        expect(result?.http?.headers?.c).to.equal('d');
    });

    it('headers class', async () => {
        const result = await toRpcHttp({
            headers: new Headers({
                e: 'f',
            }),
        });
        expect(result?.http?.headers?.e).to.equal('f');
    });

    it('headers invalid', async () => {
        await expect(toRpcHttp({ headers: true })).to.eventually.be.rejectedWith(/argument.*could not be converted/i);
    });
});
