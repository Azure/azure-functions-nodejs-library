// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HttpRequestParams, HttpRequestUser } from '@azure/functions';
import { RpcHttpData, RpcTypedData } from '@azure/functions-core';
import { Blob } from 'buffer';
import { IncomingMessage } from 'http';
import * as stream from 'stream';
import { ReadableStream } from 'stream/web';
import { URLSearchParams } from 'url';
import { fromNullableMapping } from '../converters/fromRpcNullable';
import { fromRpcTypedData } from '../converters/fromRpcTypedData';
import { AzFuncSystemError } from '../errors';
import { isDefined, nonNullProp } from '../utils/nonNull';
import { extractHttpUserFromHeaders } from './extractHttpUserFromHeaders';

interface InternalHttpRequestInit extends RpcHttpData {
    nativeRequest?: Request;
}

export class HttpRequest implements types.HttpRequest {
    readonly query: URLSearchParams;
    readonly params: HttpRequestParams;

    #cachedUser?: HttpRequestUser | null;
    #nativeReq: Request;
    #init: InternalHttpRequestInit;

    constructor(init: InternalHttpRequestInit) {
        this.#init = init;

        let nativeReq = init.nativeRequest;
        if (!nativeReq) {
            const url = nonNullProp(init, 'url');

            let body: Buffer | string | undefined;
            if (init.body?.bytes) {
                body = Buffer.from(init.body?.bytes);
            } else if (init.body?.string) {
                body = init.body.string;
            }

            nativeReq = new Request(url, {
                body,
                method: nonNullProp(init, 'method'),
                headers: fromNullableMapping(init.nullableHeaders, init.headers),
            });
        }
        this.#nativeReq = nativeReq;

        if (init.nullableQuery || init.query) {
            this.query = new URLSearchParams(fromNullableMapping(init.nullableQuery, init.query));
        } else {
            this.query = new URL(this.#nativeReq.url).searchParams;
        }

        this.params = fromNullableMapping(init.nullableParams, init.params);
    }

    get url(): string {
        return this.#nativeReq.url;
    }

    get method(): string {
        return this.#nativeReq.method;
    }

    get headers(): Headers {
        return this.#nativeReq.headers;
    }

    get user(): HttpRequestUser | null {
        if (this.#cachedUser === undefined) {
            this.#cachedUser = extractHttpUserFromHeaders(this.headers);
        }

        return this.#cachedUser;
    }

    get body(): ReadableStream<any> | null {
        return this.#nativeReq.body;
    }

    get bodyUsed(): boolean {
        return this.#nativeReq.bodyUsed;
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        return this.#nativeReq.arrayBuffer();
    }

    async blob(): Promise<Blob> {
        return this.#nativeReq.blob();
    }

    // eslint-disable-next-line deprecation/deprecation
    async formData(): Promise<FormData> {
        // eslint-disable-next-line deprecation/deprecation
        return this.#nativeReq.formData();
    }

    async json(): Promise<unknown> {
        return this.#nativeReq.json();
    }

    async text(): Promise<string> {
        return this.#nativeReq.text();
    }

    clone(): HttpRequest {
        // Exclude nativeRequest from structuredClone since Request objects can't be cloned that way
        const { nativeRequest: _nativeRequest, ...initWithoutNativeReq } = this.#init;
        const newInit: InternalHttpRequestInit = structuredClone(initWithoutNativeReq);
        newInit.nativeRequest = this.#nativeReq.clone();
        return new HttpRequest(newInit);
    }
}

export function createStreamRequest(
    proxyReq: IncomingMessage,
    triggerMetadata: Record<string, RpcTypedData>
): HttpRequest {
    const hostHeaderName = 'x-forwarded-host';
    const protoHeaderName = 'x-forwarded-proto';
    const host = proxyReq.headers[hostHeaderName];
    const proto = proxyReq.headers[protoHeaderName];
    if (typeof host !== 'string' || typeof proto !== 'string') {
        throw new AzFuncSystemError(`Expected headers "${hostHeaderName}" and "${protoHeaderName}" to be set.`);
    }
    const url = `${proto}://${host}${nonNullProp(proxyReq, 'url')}`;

    let body: stream.Readable | undefined;
    const lowerMethod = proxyReq.method?.toLowerCase();
    if (lowerMethod !== 'get' && lowerMethod !== 'head') {
        body = proxyReq;
    }

    // Get headers and params from trigger metadata
    // See here for more info: https://github.com/Azure/azure-functions-host/issues/9840
    // NOTE: We ignore query info because it has this bug: https://github.com/Azure/azure-functions-nodejs-library/issues/168
    const { Query: rpcQueryIgnored, Headers: rpcHeaders, ...rpcParams } = triggerMetadata;

    let headers: types.HttpHeadersInit | undefined;
    const headersData = fromRpcTypedData(rpcHeaders);
    if (typeof headersData === 'object' && isDefined(headersData)) {
        headers = <types.HttpHeadersInit>headersData;
    }

    const nativeReq = new Request(url, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: body as any,
        duplex: 'half',
        method: nonNullProp(proxyReq, 'method'),
        headers,
    });

    const params: Record<string, string> = {};
    for (const [key, rpcValue] of Object.entries(rpcParams)) {
        if (isDefined(rpcValue.string)) {
            params[key] = rpcValue.string;
        }
    }

    return new HttpRequest({
        nativeRequest: nativeReq,
        params,
    });
}
