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
            },
        };
    }

    it('hello world', async () => {
        const result = await toRpcHttp('invocId', { body: 'hello world' });
        expect(result).to.deep.equal(getExpectedRpcHttp('hello world', textPlainHeaders));
    });

    it('response class hello world', async () => {
        const result = await toRpcHttp('invocId', new HttpResponse({ body: 'hello world' }));
        expect(result).to.deep.equal(getExpectedRpcHttp('hello world', textPlainHeaders));
    });

    it('response class json', async () => {
        const result = await toRpcHttp('invocId', new HttpResponse({ jsonBody: { hello: 'world' } }));
        expect(result).to.deep.equal(getExpectedRpcHttp('{"hello":"world"}', jsonHeaders));
    });

    it('response class json manual json', async () => {
        const req = new HttpResponse({ body: '{ "hello":  "world" }' });
        req.headers.set('content-type', 'application/json');
        const result = await toRpcHttp('invocId', req);
        expect(result).to.deep.equal(
            getExpectedRpcHttp('{ "hello":  "world" }', {
                'content-type': 'application/json',
            })
        );
    });

    it('undefined', async () => {
        const result = await toRpcHttp('invocId', {});
        expect(result).to.deep.equal(getExpectedRpcHttp('', {}));
    });

    it('array (weird, but still valid)', async () => {
        const result = await toRpcHttp('invocId', Object.assign([], { body: 'a' }));
        expect(result).to.deep.equal(getExpectedRpcHttp('a', textPlainHeaders));
    });

    it('invalid data string', async () => {
        await expect(toRpcHttp('invocId', 'invalid')).to.eventually.be.rejectedWith(/must be an object/i);
    });

    it('invalid data boolean', async () => {
        await expect(toRpcHttp('invocId', true)).to.eventually.be.rejectedWith(/must be an object/i);
    });

    it('body buffer', async () => {
        const result = await toRpcHttp('invocId', { body: Buffer.from('b') });
        expect(result).to.deep.equal(getExpectedRpcHttp('b', {}));
    });

    it('body number', async () => {
        const result = await toRpcHttp('invocId', { body: 3 });
        expect(result).to.deep.equal(getExpectedRpcHttp('3', textPlainHeaders));
    });

    it('status number', async () => {
        const result = await toRpcHttp('invocId', { status: 400 });
        expect(result).to.deep.equal(getExpectedRpcHttp('', {}, '400'));
    });

    it('status string', async () => {
        const result = await toRpcHttp('invocId', { status: '500' });
        expect(result).to.deep.equal(getExpectedRpcHttp('', {}, '500'));
    });

    it('status invalid', async () => {
        await expect(toRpcHttp('invocId', { status: {} })).to.eventually.be.rejectedWith(/status/i);
    });

    it('headers object', async () => {
        const result = await toRpcHttp('invocId', {
            headers: {
                a: 'b',
            },
        });
        expect(result?.http?.headers?.a).to.equal('b');
    });

    it('headers array', async () => {
        const result = await toRpcHttp('invocId', {
            headers: [['c', 'd']],
        });
        expect(result?.http?.headers?.c).to.equal('d');
    });

    it('headers class', async () => {
        const result = await toRpcHttp('invocId', {
            headers: new Headers({
                e: 'f',
            }),
        });
        expect(result?.http?.headers?.e).to.equal('f');
    });

    it('headers invalid', async () => {
        await expect(toRpcHttp('invocId', { headers: true })).to.eventually.be.rejectedWith(
            /argument.*could not be converted/i
        );
    });
});
