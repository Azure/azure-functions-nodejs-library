// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HttpMethod, HttpRequestParams, HttpRequestUser } from '@azure/functions';
import { RpcHttpData } from '@azure/functions-core';
import { Blob } from 'buffer';
import { ReadableStream } from 'stream/web';
import { FormData, Headers, Request as uRequest } from 'undici';
import { URLSearchParams } from 'url';
import { HeaderName } from '../constants';
import { fromNullableMapping } from '../converters/fromRpcNullable';
import { AzFuncSystemError } from '../errors';
import { parseForm } from '../parsers/parseForm';
import { nonNullProp } from '../utils/nonNull';
import { extractHttpUserFromHeaders } from './extractHttpUserFromHeaders';

export class HttpRequest implements types.HttpRequest {
    method: HttpMethod;
    url: string;
    headers: Headers;
    query: URLSearchParams;
    params: HttpRequestParams;

    #cachedUser?: HttpRequestUser | null;
    #uReq: uRequest;
    #body?: Buffer | string;

    constructor(rpcHttp: RpcHttpData) {
        const url = nonNullProp(rpcHttp, 'url');

        if (rpcHttp.body?.bytes) {
            this.#body = Buffer.from(rpcHttp.body?.bytes);
        } else if (rpcHttp.body?.string) {
            this.#body = rpcHttp.body.string;
        }

        this.#uReq = new uRequest(url, {
            body: this.#body,
            method: nonNullProp(rpcHttp, 'method'),
            headers: fromNullableMapping(rpcHttp.nullableHeaders, rpcHttp.headers),
        });

        this.method = <HttpMethod>nonNullProp(rpcHttp, 'method');
        this.url = url;
        this.headers = this.#uReq.headers;
        this.query = new URLSearchParams(fromNullableMapping(rpcHttp.nullableQuery, rpcHttp.query));
        this.params = fromNullableMapping(rpcHttp.nullableParams, rpcHttp.params);
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
        return await this.#uReq.arrayBuffer();
    }

    async blob(): Promise<Blob> {
        return await this.#uReq.blob();
    }

    /**
     * undici doesn't support this yet, so we'll use our own implementation for now
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async formData(): Promise<FormData> {
        const contentType = this.headers.get(HeaderName.contentType);
        if (!contentType) {
            throw new AzFuncSystemError(`"${HeaderName.contentType}" header must be defined.`);
        } else if (!this.#body) {
            return new FormData();
        } else {
            return parseForm(this.#body, contentType);
        }
    }

    async json(): Promise<unknown> {
        return await this.#uReq.json();
    }

    async text(): Promise<string> {
        return await this.#uReq.text();
    }
}
