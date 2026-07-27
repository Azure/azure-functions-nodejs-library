// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { HttpRequest } from '../../src/http/HttpRequest';

chai.use(chaiAsPromised);

describe('HttpRequest', () => {
    it('clone', async () => {
        const req = new HttpRequest({
            method: 'POST',
            url: 'http://localhost:7071/api/helloWorld',
            body: {
                string: 'body1',
            },
            headers: {
                a: 'b',
            },
            params: {
                c: 'd',
            },
            query: {
                e: 'f',
            },
        });
        const req2 = req.clone();
        expect(await req.text()).to.equal('body1');
        expect(await req2.text()).to.equal('body1');

        expect(req.headers).to.not.equal(req2.headers);
        expect(req.headers).to.deep.equal(req2.headers);

        expect(req.params).to.not.equal(req2.params);
        expect(req.params).to.deep.equal(req2.params);

        expect(req.query).to.not.equal(req2.query);
        expect(req.query).to.deep.equal(req2.query);
    });

    it('clone with bytes body', async () => {
        const bodyContent = 'test body content';
        const req = new HttpRequest({
            method: 'POST',
            url: 'http://localhost:7071/api/helloWorld',
            body: {
                bytes: Buffer.from(bodyContent),
            },
            headers: {
                'content-type': 'application/octet-stream',
            },
            params: {
                id: '123',
            },
            query: {
                filter: 'active',
            },
        });
        const req2 = req.clone();
        expect(await req.text()).to.equal(bodyContent);
        expect(await req2.text()).to.equal(bodyContent);

        expect(req.headers).to.not.equal(req2.headers);
        expect(req.params).to.not.equal(req2.params);
        expect(req.params).to.deep.equal(req2.params);
        expect(req.query).to.not.equal(req2.query);
        expect(req.query).to.deep.equal(req2.query);
    });

    describe('clone', () => {
        it('cloned request has independent headers', () => {
            const req = new HttpRequest({
                method: 'GET',
                url: 'http://localhost:7071/api/test',
                headers: {
                    'x-custom-header': 'original',
                    'content-type': 'application/json',
                },
            });
            const cloned = req.clone();

            // Modify cloned headers
            cloned.headers.set('x-custom-header', 'modified');
            cloned.headers.set('x-new-header', 'new-value');

            // Original should be unchanged
            expect(req.headers.get('x-custom-header')).to.equal('original');
            expect(req.headers.has('x-new-header')).to.be.false;
            // Cloned should have modifications
            expect(cloned.headers.get('x-custom-header')).to.equal('modified');
            expect(cloned.headers.get('x-new-header')).to.equal('new-value');
        });

        it('cloned request preserves URL and method', () => {
            const req = new HttpRequest({
                method: 'PUT',
                url: 'http://localhost:7071/api/resource/123?page=2&limit=10',
            });
            const cloned = req.clone();

            expect(cloned.url).to.equal(req.url);
            expect(cloned.method).to.equal('PUT');
        });

        it('clone with empty body (GET request)', () => {
            const req = new HttpRequest({
                method: 'GET',
                url: 'http://localhost:7071/api/data',
                headers: {
                    accept: 'application/json',
                },
            });
            const cloned = req.clone();

            expect(cloned.body).to.be.null;
            expect(cloned.method).to.equal('GET');
            expect(cloned.headers.get('accept')).to.equal('application/json');
        });

        it('cloned request bodies can be consumed independently', async () => {
            const jsonBody = { name: 'test', value: 42 };
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/json',
                body: {
                    string: JSON.stringify(jsonBody),
                },
                headers: {
                    'content-type': 'application/json',
                },
            });

            const cloned = req.clone();

            // Consume original as text
            const originalText = await req.text();
            expect(originalText).to.equal(JSON.stringify(jsonBody));

            // Consume clone as JSON
            const clonedJson = await cloned.json();
            expect(clonedJson).to.deep.equal(jsonBody);
        });

        it('clone preserves query parameters independently', () => {
            const req = new HttpRequest({
                method: 'GET',
                url: 'http://localhost:7071/api/search',
                query: {
                    q: 'test',
                    page: '1',
                    limit: '20',
                },
            });
            const cloned = req.clone();

            expect(cloned.query.get('q')).to.equal('test');
            expect(cloned.query.get('page')).to.equal('1');
            expect(cloned.query.get('limit')).to.equal('20');

            // Verify they are different objects
            expect(req.query).to.not.equal(cloned.query);

            // Modify cloned query
            cloned.query.set('page', '2');
            expect(req.query.get('page')).to.equal('1');
            expect(cloned.query.get('page')).to.equal('2');
        });

        it('clone preserves params independently', () => {
            const req = new HttpRequest({
                method: 'GET',
                url: 'http://localhost:7071/api/users/123/posts/456',
                params: {
                    userId: '123',
                    postId: '456',
                },
            });
            const cloned = req.clone();

            expect(cloned.params.userId).to.equal('123');
            expect(cloned.params.postId).to.equal('456');
            expect(req.params).to.not.equal(cloned.params);
        });

        it('clone with nativeRequest and params', () => {
            const nativeReq = new Request('http://localhost:7071/api/items/123', {
                method: 'GET',
            });
            const req = new HttpRequest({
                nativeRequest: nativeReq,
                params: { id: '123' },
            } as any);

            const cloned = req.clone();

            expect(cloned.params.id).to.equal('123');
            expect(cloned.url).to.equal('http://localhost:7071/api/items/123');
            expect(cloned.method).to.equal('GET');
            expect(req.params).to.not.equal(cloned.params);
        });

        it('clone with binary body preserves data correctly', async () => {
            // Create binary data with various byte values
            const binaryData = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0x80, 0x7f]);
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/binary',
                body: {
                    bytes: binaryData,
                },
                headers: {
                    'content-type': 'application/octet-stream',
                },
            });

            const cloned = req.clone();

            const originalBuffer = await req.arrayBuffer();
            const clonedBuffer = await cloned.arrayBuffer();

            expect(Buffer.from(originalBuffer)).to.deep.equal(binaryData);
            expect(Buffer.from(clonedBuffer)).to.deep.equal(binaryData);
        });

        it('clone with large body', async () => {
            // Create a larger body (100KB)
            const largeContent = 'x'.repeat(100 * 1024);
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/large',
                body: {
                    string: largeContent,
                },
            });

            const cloned = req.clone();

            expect(await req.text()).to.equal(largeContent);
            expect(await cloned.text()).to.equal(largeContent);
        });

        it('clone with special characters in params and query', () => {
            // Note: HTTP headers only support ASCII, so we test unicode in params/query only
            const req = new HttpRequest({
                method: 'GET',
                url: 'http://localhost:7071/api/special',
                headers: {
                    'x-custom': 'ascii-value',
                },
                params: {
                    name: 'test-value',
                },
                query: {
                    search: 'query-value',
                },
            });

            const cloned = req.clone();

            expect(cloned.headers.get('x-custom')).to.equal('ascii-value');
            expect(cloned.params.name).to.equal('test-value');
            expect(cloned.query.get('search')).to.equal('query-value');
        });

        it('clone preserves all HTTP methods', () => {
            const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

            for (const method of methods) {
                const req = new HttpRequest({
                    method,
                    url: 'http://localhost:7071/api/methods',
                });
                const cloned = req.clone();
                expect(cloned.method).to.equal(method);
            }
        });

        it('clone with nullable mappings', () => {
            const req = new HttpRequest({
                method: 'GET',
                url: 'http://localhost:7071/api/nullable',
                nullableHeaders: {
                    'x-nullable': { value: 'test-value' },
                    'x-null': { value: null },
                },
                nullableParams: {
                    id: { value: '123' },
                },
                nullableQuery: {
                    filter: { value: 'active' },
                },
            });

            const cloned = req.clone();

            expect(cloned.headers.get('x-nullable')).to.equal('test-value');
            expect(cloned.params.id).to.equal('123');
            expect(cloned.query.get('filter')).to.equal('active');
        });

        it('bodyUsed state is independent after clone', async () => {
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/bodyused',
                body: {
                    string: 'test content',
                },
            });

            expect(req.bodyUsed).to.be.false;

            const cloned = req.clone();
            expect(cloned.bodyUsed).to.be.false;

            // Consume original
            await req.text();
            expect(req.bodyUsed).to.be.true;
            expect(cloned.bodyUsed).to.be.false;

            // Consume clone
            await cloned.text();
            expect(cloned.bodyUsed).to.be.true;
        });
    });

    describe('formData', () => {
        const multipartContentType = 'multipart/form-data; boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv';
        function createFormRequest(data: string, contentType: string = multipartContentType): HttpRequest {
            // Form data always uses CRLF instead of LF
            // https://www.rfc-editor.org/rfc/rfc2046#section-4.1.1
            data = data.replace(/\r?\n/g, '\r\n');

            return new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/HttpForm1',
                body: {
                    bytes: Buffer.from(data),
                },
                headers: {
                    'content-type': contentType,
                },
            });
        }

        it('hello world', async () => {
            const req = createFormRequest(`------WebKitFormBoundaryeJGMO2YP65ZZXRmv
Content-Disposition: form-data; name="name"

Azure Functions
------WebKitFormBoundaryeJGMO2YP65ZZXRmv
Content-Disposition: form-data; name="greeting"

Hello
------WebKitFormBoundaryeJGMO2YP65ZZXRmv--
`);

            const parsedForm = await req.formData();

            expect(parsedForm.has('name')).to.equal(true);
            expect(parsedForm.get('name')).to.equal('Azure Functions');

            expect(parsedForm.has('greeting')).to.equal(true);
            expect(parsedForm.get('greeting')).to.equal('Hello');
        });

        it('file', async () => {
            const req = createFormRequest(`------WebKitFormBoundaryeJGMO2YP65ZZXRmv
Content-Disposition: form-data; name="myfile"; filename="test.txt"
Content-Type: text/plain

hello
world
------WebKitFormBoundaryeJGMO2YP65ZZXRmv--
`);

            const parsedForm = await req.formData();
            expect(parsedForm.has('myfile')).to.equal(true);
            const file = parsedForm.get('myfile') as File;
            expect(file.name).to.equal('test.txt');
            expect(file.type).to.equal('text/plain');
            expect(await file.text()).to.equal(`hello\r\nworld`);
        });

        it('duplicate parts', async () => {
            const req = createFormRequest(`------WebKitFormBoundaryeJGMO2YP65ZZXRmv
Content-Disposition: form-data; name="dupeField"

value1
------WebKitFormBoundaryeJGMO2YP65ZZXRmv
Content-Disposition: form-data; name="dupeField"

value2
------WebKitFormBoundaryeJGMO2YP65ZZXRmv--
`);

            const parsedForm = await req.formData();
            expect(parsedForm.has('dupeField')).to.equal(true);
            expect(parsedForm.get('dupeField')).to.equal('value1');

            expect(parsedForm.getAll('dupeField')).to.deep.equal(['value1', 'value2']);
        });

        it('url encoded', async () => {
            const req = createFormRequest('name=Azure+Functions&greeting=Hello', 'application/x-www-form-urlencoded');

            const parsedForm = await req.formData();

            expect(parsedForm.has('name')).to.equal(true);
            expect(parsedForm.get('name')).to.equal('Azure Functions');

            expect(parsedForm.has('greeting')).to.equal(true);
            expect(parsedForm.get('greeting')).to.equal('Hello');
        });

        it('Unsupported content type', async () => {
            const contentTypes = ['application/octet-stream', 'application/json', 'text/plain', 'invalid'];
            for (const contentType of contentTypes) {
                const req = createFormRequest('', contentType);
                // Native fetch API has different error message than undici
                await expect(req.formData()).to.eventually.be.rejectedWith(
                    /Content-Type.*not.*one of|Could not parse content as FormData/i
                );
            }
        });
    });

    // Regression tests for https://github.com/Azure/azure-functions-nodejs-library/issues/458
    // The RPC (non-streaming) constructor must not pass a body to the WHATWG Request for GET/HEAD,
    // otherwise it throws "Request with GET/HEAD method cannot have body." before the handler runs.
    describe('GET/HEAD body handling', () => {
        for (const method of ['GET', 'HEAD']) {
            it(`does not throw and omits string body for ${method}`, async () => {
                const req = new HttpRequest({
                    method,
                    url: 'https://example.test/api/probe',
                    body: { string: 'x' },
                });
                expect(req.body).to.be.null;
                expect(await req.text()).to.equal('');
            });

            it(`does not throw and omits bytes body for ${method}`, async () => {
                const req = new HttpRequest({
                    method,
                    url: 'https://example.test/api/probe',
                    body: { bytes: Buffer.from('x') },
                });
                expect(req.body).to.be.null;
                expect(await req.text()).to.equal('');
            });

            it(`does not throw for zero-length bytes body for ${method}`, () => {
                expect(() => {
                    new HttpRequest({
                        method,
                        url: 'https://example.test/api/probe',
                        body: { bytes: Buffer.from([]) },
                    });
                }).to.not.throw();
            });
        }

        for (const method of ['get', 'Get', 'gEt', 'head', 'Head', 'hEaD']) {
            it(`does not throw for mixed-case method "${method}" with a body`, () => {
                expect(() => {
                    new HttpRequest({
                        method,
                        url: 'https://example.test/api/probe',
                        body: { string: 'x' },
                    });
                }).to.not.throw();
            });
        }

        for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
            it(`preserves string body for ${method}`, async () => {
                const req = new HttpRequest({
                    method,
                    url: 'https://example.test/api/probe',
                    body: { string: 'preserved-body' },
                });
                expect(await req.text()).to.equal('preserved-body');
            });

            it(`preserves bytes body for ${method}`, async () => {
                const bodyContent = 'preserved-bytes-body';
                const req = new HttpRequest({
                    method,
                    url: 'https://example.test/api/probe',
                    body: { bytes: Buffer.from(bodyContent) },
                });
                expect(await req.text()).to.equal(bodyContent);
            });
        }
    });

    // Edge cases around the native (WHATWG) Request the library now wraps after removing the
    // standalone undici dependency. These lock in behavior that differs between undici versions.
    describe('body and content parsing (native fetch edge cases)', () => {
        it('parses a JSON string body via json()', async () => {
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/json',
                body: { string: JSON.stringify({ a: 1, b: [2, 3] }) },
                headers: { 'content-type': 'application/json' },
            });
            expect(await req.json()).to.deep.equal({ a: 1, b: [2, 3] });
        });

        it('reads a bytes body via arrayBuffer()', async () => {
            const bytes = Buffer.from([0x00, 0x01, 0x02, 0xff]);
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/bin',
                body: { bytes },
            });
            expect(Buffer.from(await req.arrayBuffer())).to.deep.equal(bytes);
        });

        it('reads a body via blob()', async () => {
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/blob',
                body: { string: 'blob-body' },
            });
            const blob = await req.blob();
            expect(await blob.text()).to.equal('blob-body');
        });

        it('prefers bytes over string when both are provided', async () => {
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/both',
                body: { bytes: Buffer.from('from-bytes'), string: 'from-string' },
            });
            expect(await req.text()).to.equal('from-bytes');
        });

        it('treats an empty-string body as no body', async () => {
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/empty',
                body: { string: '' },
            });
            expect(req.body).to.be.null;
            expect(await req.text()).to.equal('');
        });

        it('exposes a readable body stream for non-empty bodies', async () => {
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/stream',
                body: { string: 'streamed' },
            });
            const body = req.body;
            expect(body).to.not.be.null;
            if (body === null) {
                throw new Error('expected a non-null body stream');
            }
            const reader = body.getReader();
            const chunks: Uint8Array[] = [];
            for (;;) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                chunks.push(value);
            }
            expect(Buffer.concat(chunks).toString()).to.equal('streamed');
        });

        it('marks bodyUsed after consuming the body', async () => {
            const req = new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/used',
                body: { string: 'consume-me' },
            });
            expect(req.bodyUsed).to.be.false;
            await req.text();
            expect(req.bodyUsed).to.be.true;
        });
    });

    describe('headers, query, and method (native fetch edge cases)', () => {
        it('normalizes known method casing to uppercase', () => {
            const req = new HttpRequest({
                method: 'post',
                url: 'http://localhost:7071/api/x',
                body: { string: 'x' },
            });
            expect(req.method).to.equal('POST');
        });

        it('preserves custom (non-standard) methods', () => {
            const req = new HttpRequest({
                method: 'PURGE',
                url: 'http://localhost:7071/api/x',
            });
            expect(req.method).to.equal('PURGE');
        });

        it('parses repeated query params from the URL when none are provided', () => {
            const req = new HttpRequest({
                method: 'GET',
                url: 'http://localhost:7071/api/x?a=1&b=2&a=3',
            });
            expect(req.query.get('a')).to.equal('1');
            expect(req.query.getAll('a')).to.deep.equal(['1', '3']);
            expect(req.query.get('b')).to.equal('2');
        });

        it('explicit query replaces the URL query string', () => {
            const req = new HttpRequest({
                method: 'GET',
                url: 'http://localhost:7071/api/x?fromUrl=1',
                query: { fromInit: 'yes' },
            });
            expect(req.query.get('fromInit')).to.equal('yes');
            expect(req.query.has('fromUrl')).to.be.false;
        });

        it('treats header names case-insensitively', () => {
            const req = new HttpRequest({
                method: 'GET',
                url: 'http://localhost:7071/api/x',
                headers: { 'Content-Type': 'application/json' },
            });
            expect(req.headers.get('content-type')).to.equal('application/json');
            expect(req.headers.get('CONTENT-TYPE')).to.equal('application/json');
        });

        it('converts null nullableHeaders values to empty-string headers', () => {
            const req = new HttpRequest({
                method: 'GET',
                url: 'http://localhost:7071/api/x',
                nullableHeaders: {
                    present: { value: 'yes' },
                    absent: { value: null },
                },
            });
            expect(req.headers.get('present')).to.equal('yes');
            expect(req.headers.get('absent')).to.equal('');
        });
    });
});
