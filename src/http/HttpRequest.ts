// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HttpRequestParams, HttpRequestUser } from '@azure/functions';
import { RpcHttpData } from '@azure/functions-core';
import { Blob } from 'buffer';
import { IncomingMessage } from 'http';
import * as stream from 'stream';
import { ReadableStream } from 'stream/web';
import { FormData, Headers, Request as uRequest } from 'undici';
import { URLSearchParams } from 'url';
import { fromNullableMapping } from '../converters/fromRpcNullable';
import { AzFuncSystemError } from '../errors';
import { nonNullProp } from '../utils/nonNull';
import { extractHttpUserFromHeaders } from './extractHttpUserFromHeaders';

interface InternalHttpRequestInit extends RpcHttpData {
    undiciRequest?: uRequest;
    proxyRequest?: IncomingMessage;
}

type RequestInitResult = [uRequest, URLSearchParams, HttpRequestParams];

export class HttpRequest implements types.HttpRequest {
    readonly query: URLSearchParams;
    readonly params: HttpRequestParams;

    #cachedUser?: HttpRequestUser | null;
    #uReq: uRequest;
    #init: InternalHttpRequestInit;

    constructor(init: InternalHttpRequestInit) {
        this.#init = init;

        if (init.proxyRequest) {
            [this.#uReq, this.query, this.params] = this.#initStreamRequest(init);
        } else {
            [this.#uReq, this.query, this.params] = this.#initInMemoryRequest(init);
        }
    }

    #initInMemoryRequest(init: InternalHttpRequestInit): RequestInitResult {
        let uReq = init.undiciRequest;
        if (!uReq) {
            const url = nonNullProp(init, 'url');

            let body: Buffer | string | undefined;
            if (init.body?.bytes) {
                body = Buffer.from(init.body?.bytes);
            } else if (init.body?.string) {
                body = init.body.string;
            }

            uReq = new uRequest(url, {
                body,
                method: nonNullProp(init, 'method'),
                headers: fromNullableMapping(init.nullableHeaders, init.headers),
            });
        }

        const query = new URLSearchParams(fromNullableMapping(init.nullableQuery, init.query));
        const params = fromNullableMapping(init.nullableParams, init.params);

        return [uReq, query, params];
    }

    #initStreamRequest(init: InternalHttpRequestInit): RequestInitResult {
        const proxyReq = nonNullProp(init, 'proxyRequest');

        const hostHeaderName = 'x-forwarded-host';
        const protoHeaderName = 'x-forwarded-proto';
        const host = proxyReq.headers[hostHeaderName];
        const proto = proxyReq.headers[protoHeaderName];
        if (typeof host !== 'string' || typeof proto !== 'string') {
            throw new AzFuncSystemError(`Expected headers "${hostHeaderName}" and "${protoHeaderName}" to be set.`);
        }
        const url = `${proto}://${host}${nonNullProp(proxyReq, 'url')}`;

        let uReq = init.undiciRequest;
        if (!uReq) {
            let body: stream.Readable | undefined;
            const lowerMethod = proxyReq.method?.toLowerCase();
            if (lowerMethod !== 'get' && lowerMethod !== 'head') {
                body = proxyReq;
            }

            uReq = new uRequest(url, {
                body: body,
                duplex: 'half',
                method: nonNullProp(proxyReq, 'method'),
                headers: <Record<string, string | ReadonlyArray<string>>>proxyReq.headers,
            });
        }

        const query = new URL(url).searchParams;
        const params = fromNullableMapping(init.nullableParams, init.params);

        return [uReq, query, params];
    }

    get url(): string {
        return this.#uReq.url;
    }

    get method(): string {
        return this.#uReq.method;
    }

    get headers(): Headers {
        return this.#uReq.headers;
    }

    get user(): HttpRequestUser | null {
        if (this.#cachedUser === undefined) {
            this.#cachedUser = extractHttpUserFromHeaders(this.headers);
        }

        return this.#cachedUser;
    }

    get body(): ReadableStream<any> | null {
        return this.#uReq.body;
    }

    get bodyUsed(): boolean {
        return this.#uReq.bodyUsed;
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        return this.#uReq.arrayBuffer();
    }

    async blob(): Promise<Blob> {
        return this.#uReq.blob();
    }

    async formData(): Promise<FormData> {
        return this.#uReq.formData();
    }

    async json(): Promise<unknown> {
        return this.#uReq.json();
    }

    async text(): Promise<string> {
        return this.#uReq.text();
    }

    clone(): HttpRequest {
        const newInit = structuredClone(this.#init);
        newInit.undiciRequest = this.#uReq.clone();
        return new HttpRequest(newInit);
    }
}
