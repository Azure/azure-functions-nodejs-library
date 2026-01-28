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
    });
});
