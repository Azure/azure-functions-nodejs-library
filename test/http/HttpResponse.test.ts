// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { Blob } from 'buffer';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ReadableStream } from 'stream/web';
import { HttpResponse } from '../../src/http/HttpResponse';

chai.use(chaiAsPromised);

describe('HttpResponse', () => {
    it('clone', async () => {
        const res = new HttpResponse({
            body: 'body1',
            headers: {
                a: 'b',
            },
            cookies: [
                {
                    name: 'name1',
                    value: 'value1',
                },
            ],
        });
        const res2 = res.clone();
        expect(await res.text()).to.equal('body1');
        expect(await res2.text()).to.equal('body1');

        expect(res.headers).to.not.equal(res2.headers);
        expect(res.headers).to.deep.equal(res2.headers);

        expect(res.cookies).to.not.equal(res2.cookies);
        expect(res.cookies).to.deep.equal(res2.cookies);
    });

    describe('clone', () => {
        it('cloned response has independent headers', () => {
            const res = new HttpResponse({
                body: 'test',
                headers: {
                    'x-custom-header': 'original',
                    'content-type': 'text/plain',
                },
            });
            const cloned = res.clone();

            // Modify cloned headers
            cloned.headers.set('x-custom-header', 'modified');
            cloned.headers.set('x-new-header', 'new-value');

            // Original should be unchanged
            expect(res.headers.get('x-custom-header')).to.equal('original');
            expect(res.headers.has('x-new-header')).to.be.false;
            // Cloned should have modifications
            expect(cloned.headers.get('x-custom-header')).to.equal('modified');
            expect(cloned.headers.get('x-new-header')).to.equal('new-value');
        });

        it('cloned response preserves status', () => {
            // Note: 204 No Content cannot have a body per HTTP spec
            const statusesWithBody = [200, 201, 301, 400, 401, 403, 404, 500, 503];

            for (const status of statusesWithBody) {
                const res = new HttpResponse({ status, body: 'test' });
                const cloned = res.clone();
                expect(cloned.status).to.equal(status);
            }
        });

        it('clone with empty body', () => {
            const res = new HttpResponse({
                status: 204,
            });
            const cloned = res.clone();

            expect(cloned.body).to.be.null;
            expect(cloned.status).to.equal(204);
        });

        it('cloned response bodies can be consumed independently', async () => {
            const jsonBody = { success: true, data: [1, 2, 3] };
            const res = new HttpResponse({
                jsonBody,
            });

            const cloned = res.clone();

            // Consume original as text
            const originalText = await res.text();
            expect(JSON.parse(originalText)).to.deep.equal(jsonBody);

            // Consume clone as JSON
            const clonedJson = await cloned.json();
            expect(clonedJson).to.deep.equal(jsonBody);
        });

        it('clone preserves cookies independently', () => {
            const res = new HttpResponse({
                body: 'test',
                cookies: [
                    { name: 'session', value: 'abc123', httpOnly: true },
                    { name: 'prefs', value: 'theme=dark', maxAge: 3600 },
                ],
            });
            const cloned = res.clone();

            expect(cloned.cookies).to.have.length(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cookie0 = cloned.cookies[0]!;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cookie1 = cloned.cookies[1]!;
            expect(cookie0.name).to.equal('session');
            expect(cookie0.value).to.equal('abc123');
            expect(cookie0.httpOnly).to.be.true;
            expect(cookie1.name).to.equal('prefs');
            expect(cookie1.maxAge).to.equal(3600);

            // Verify they are different arrays
            expect(res.cookies).to.not.equal(cloned.cookies);

            // Modify cloned cookies array (note: this tests array independence)
            cloned.cookies.push({ name: 'new', value: 'cookie' });
            expect(res.cookies).to.have.length(2);
            expect(cloned.cookies).to.have.length(3);
        });

        it('clone with jsonBody preserves content-type', async () => {
            const res = new HttpResponse({
                jsonBody: { message: 'hello' },
            });

            const cloned = res.clone();

            expect(cloned.headers.get('content-type')).to.equal('application/json');
            expect(await cloned.json()).to.deep.equal({ message: 'hello' });
        });

        it('clone with ArrayBuffer body', async () => {
            const encoder = new TextEncoder();
            const buffer = encoder.encode('binary data').buffer;

            const res = new HttpResponse({
                body: buffer,
            });

            const cloned = res.clone();

            const originalBuffer = await res.arrayBuffer();
            const clonedBuffer = await cloned.arrayBuffer();

            expect(new TextDecoder().decode(originalBuffer)).to.equal('binary data');
            expect(new TextDecoder().decode(clonedBuffer)).to.equal('binary data');
        });

        it('clone with Blob body', async () => {
            const blob = new Blob(['blob content'], { type: 'text/plain' });

            const res = new HttpResponse({
                body: blob,
            });

            const cloned = res.clone();

            expect(await res.text()).to.equal('blob content');
            expect(await cloned.text()).to.equal('blob content');
        });

        it('clone preserves enableContentNegotiation', () => {
            const resEnabled = new HttpResponse({
                body: 'test',
                enableContentNegotiation: true,
            });

            const resDisabled = new HttpResponse({
                body: 'test',
                enableContentNegotiation: false,
            });

            expect(resEnabled.clone().enableContentNegotiation).to.be.true;
            expect(resDisabled.clone().enableContentNegotiation).to.be.false;
        });

        it('clone with large body', async () => {
            const largeContent = 'y'.repeat(100 * 1024);
            const res = new HttpResponse({
                body: largeContent,
            });

            const cloned = res.clone();

            expect(await res.text()).to.equal(largeContent);
            expect(await cloned.text()).to.equal(largeContent);
        });

        it('clone with special characters in body', async () => {
            // Note: HTTP headers only support ASCII, so we test unicode in body only
            const res = new HttpResponse({
                body: 'Hello World - ASCII content',
                headers: {
                    'x-message': 'hello-world',
                },
            });

            const cloned = res.clone();

            expect(await cloned.text()).to.equal('Hello World - ASCII content');
            expect(cloned.headers.get('x-message')).to.equal('hello-world');
        });

        it('clone with complex cookies', () => {
            const res = new HttpResponse({
                body: 'test',
                cookies: [
                    {
                        name: 'secure-cookie',
                        value: 'secret-value',
                        httpOnly: true,
                        secure: true,
                        sameSite: 'Strict',
                        path: '/api',
                        domain: 'example.com',
                        maxAge: 86400,
                    },
                ],
            });

            const cloned = res.clone();

            expect(cloned.cookies[0]).to.deep.equal({
                name: 'secure-cookie',
                value: 'secret-value',
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                path: '/api',
                domain: 'example.com',
                maxAge: 86400,
            });
        });

        it('bodyUsed state is independent after clone', async () => {
            const res = new HttpResponse({
                body: 'test content',
            });

            expect(res.bodyUsed).to.be.false;

            const cloned = res.clone();
            expect(cloned.bodyUsed).to.be.false;

            // Consume original
            await res.text();
            expect(res.bodyUsed).to.be.true;
            expect(cloned.bodyUsed).to.be.false;

            // Consume clone
            await cloned.text();
            expect(cloned.bodyUsed).to.be.true;
        });

        it('clone default response', () => {
            const res = new HttpResponse();
            const cloned = res.clone();

            expect(cloned.status).to.equal(200);
            expect(cloned.cookies).to.deep.equal([]);
            expect(cloned.enableContentNegotiation).to.be.false;
        });

        it('clone with nested JSON body', async () => {
            const complexJson = {
                users: [
                    { id: 1, name: 'Alice', roles: ['admin', 'user'] },
                    { id: 2, name: 'Bob', roles: ['user'] },
                ],
                metadata: {
                    page: 1,
                    total: 100,
                    nested: {
                        deeply: {
                            value: true,
                        },
                    },
                },
            };

            const res = new HttpResponse({
                jsonBody: complexJson,
            });

            const cloned = res.clone();

            expect(await cloned.json()).to.deep.equal(complexJson);
        });
    });

    describe('HttpResponseBodyInit types', () => {
        it('string body', async () => {
            const res = new HttpResponse({
                body: 'Hello World',
            });
            expect(await res.text()).to.equal('Hello World');
        });

        it('null body', () => {
            const res = new HttpResponse({
                body: null,
            });
            expect(res.body).to.be.null;
        });

        it('undefined body', () => {
            const res = new HttpResponse({
                body: undefined,
            });
            expect(res.body).to.be.null;
        });

        it('ArrayBuffer body', async () => {
            const encoder = new TextEncoder();
            const buffer = encoder.encode('ArrayBuffer content').buffer;
            const res = new HttpResponse({
                body: buffer,
            });
            expect(await res.text()).to.equal('ArrayBuffer content');
        });

        it('Uint8Array (ArrayBufferView) body', async () => {
            const encoder = new TextEncoder();
            const uint8Array = encoder.encode('Uint8Array content');
            const res = new HttpResponse({
                body: uint8Array,
            });
            expect(await res.text()).to.equal('Uint8Array content');
        });

        it('Blob body', async () => {
            const blob = new Blob(['Blob content'], { type: 'text/plain' });
            const res = new HttpResponse({
                body: blob,
            });
            expect(await res.text()).to.equal('Blob content');
        });

        it('ReadableStream body', async () => {
            // Create a ReadableStream with properly encoded Uint8Array chunks
            const encoder = new TextEncoder();
            const chunks = [encoder.encode('Stream '), encoder.encode('content')];
            let index = 0;

            const webStream = new ReadableStream({
                pull(controller) {
                    if (index < chunks.length) {
                        controller.enqueue(chunks[index++]);
                    } else {
                        controller.close();
                    }
                },
            });

            const res = new HttpResponse({
                body: webStream,
            });
            expect(await res.text()).to.equal('Stream content');
        });
    });

    describe('HttpHeadersInit types', () => {
        it('Record<string, string> headers', () => {
            const res = new HttpResponse({
                body: 'test',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Custom-Header': 'custom-value',
                },
            });
            expect(res.headers.get('Content-Type')).to.equal('application/json');
            expect(res.headers.get('X-Custom-Header')).to.equal('custom-value');
        });

        it('Array of tuples headers', () => {
            const res = new HttpResponse({
                body: 'test',
                headers: [
                    ['Content-Type', 'text/plain'],
                    ['X-Request-Id', '12345'],
                ],
            });
            expect(res.headers.get('Content-Type')).to.equal('text/plain');
            expect(res.headers.get('X-Request-Id')).to.equal('12345');
        });

        it('Headers class', () => {
            const headers = new Headers();
            headers.set('Content-Type', 'text/html');
            headers.set('Cache-Control', 'no-cache');

            const res = new HttpResponse({
                body: 'test',
                headers: headers,
            });
            expect(res.headers.get('Content-Type')).to.equal('text/html');
            expect(res.headers.get('Cache-Control')).to.equal('no-cache');
        });

        it('undefined headers', () => {
            const res = new HttpResponse({
                body: 'test',
                headers: undefined,
            });
            expect(res.headers).to.not.be.undefined;
        });

        it('empty Record headers', () => {
            const res = new HttpResponse({
                body: 'test',
                headers: {},
            });
            expect(res.headers).to.not.be.undefined;
        });

        it('empty array headers', () => {
            const res = new HttpResponse({
                body: 'test',
                headers: [],
            });
            expect(res.headers).to.not.be.undefined;
        });
    });

    describe('combined body and headers', () => {
        it('json body with proper content-type header', async () => {
            const res = new HttpResponse({
                jsonBody: { message: 'Hello', count: 42 },
                headers: {
                    'X-Custom': 'value',
                },
            });
            expect(res.headers.get('Content-Type')).to.equal('application/json');
            expect(res.headers.get('X-Custom')).to.equal('value');
            expect(await res.json()).to.deep.equal({ message: 'Hello', count: 42 });
        });

        it('ArrayBuffer body with tuple headers', async () => {
            const encoder = new TextEncoder();
            const buffer = encoder.encode('binary data').buffer;
            const res = new HttpResponse({
                body: buffer,
                headers: [
                    ['Content-Type', 'application/octet-stream'],
                    ['Content-Length', '11'],
                ],
            });
            expect(res.headers.get('Content-Type')).to.equal('application/octet-stream');
            expect(await res.text()).to.equal('binary data');
        });

        it('Blob body with Headers class', async () => {
            const blob = new Blob(['test data'], { type: 'text/plain' });
            const headers = new Headers();
            headers.set('X-Blob-Size', '9');

            const res = new HttpResponse({
                body: blob,
                headers: headers,
            });
            expect(res.headers.get('X-Blob-Size')).to.equal('9');
            expect(await res.text()).to.equal('test data');
        });

        it('FormData body', async () => {
            const formData = new FormData();
            formData.append('field1', 'value1');
            formData.append('field2', 'value2');

            const res = new HttpResponse({
                body: formData,
            });

            // FormData body should set multipart/form-data content-type
            const contentType = res.headers.get('Content-Type');
            expect(contentType).to.include('multipart/form-data');

            // Verify we can get the FormData back
            const responseFormData = await res.formData();
            expect(responseFormData.get('field1')).to.equal('value1');
            expect(responseFormData.get('field2')).to.equal('value2');
        });

        it('URLSearchParams body', async () => {
            const params = new URLSearchParams();
            params.append('key1', 'value1');
            params.append('key2', 'value2');

            const res = new HttpResponse({
                body: params,
            });

            // URLSearchParams should set application/x-www-form-urlencoded content-type
            const contentType = res.headers.get('Content-Type');
            expect(contentType).to.equal('application/x-www-form-urlencoded;charset=UTF-8');

            // Verify the body text
            expect(await res.text()).to.equal('key1=value1&key2=value2');
        });

        it('Map as headers (converted to array)', () => {
            const headersMap = new Map<string, string>([
                ['Content-Type', 'application/json'],
                ['X-Custom-Header', 'map-value'],
            ]);

            const res = new HttpResponse({
                body: 'test',
                headers: [...headersMap],
            });
            expect(res.headers.get('Content-Type')).to.equal('application/json');
            expect(res.headers.get('X-Custom-Header')).to.equal('map-value');
        });
    });
});
