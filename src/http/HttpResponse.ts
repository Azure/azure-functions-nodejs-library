// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HttpResponseInit } from '@azure/functions';
import { Blob } from 'buffer';
import { ReadableStream } from 'stream/web';
import { isDefined } from '../utils/nonNull';

interface InternalHttpResponseInit extends HttpResponseInit {
    nativeResponse?: Response;
}

// Statuses that cannot have a body per the WHATWG fetch spec ("null body status"), limited to the
// valid Response status range (200-599). The global Response constructor throws if a body is provided.
const nullBodyStatuses = new Set([204, 205, 304]);

export class HttpResponse implements types.HttpResponse {
    readonly cookies: types.Cookie[];
    readonly enableContentNegotiation: boolean;

    #nativeRes: Response;
    #init: InternalHttpResponseInit;

    constructor(init?: InternalHttpResponseInit) {
        init ??= {};
        this.#init = init;

        if (init.nativeResponse) {
            this.#nativeRes = init.nativeResponse;
        } else {
            const resInit: ResponseInit = { status: init.status, headers: init.headers };
            // 204/205/304 responses cannot have a body. The global Response constructor throws if one
            // is provided, so omit it to avoid crashing when converting a handler's response. This
            // mirrors the GET/HEAD body handling in HttpRequest.
            // See https://github.com/Azure/azure-functions-nodejs-library/issues/458
            const isNullBodyStatus = isDefined(init.status) && nullBodyStatuses.has(init.status);
            if (isDefined(init.jsonBody) && !isNullBodyStatus) {
                // Response.json is not available in all versions, so we create it manually
                const jsonBody = JSON.stringify(init.jsonBody);
                const jsonHeaders = new Headers(resInit.headers);
                if (!jsonHeaders.has('content-type')) {
                    jsonHeaders.set('content-type', 'application/json');
                }
                this.#nativeRes = new Response(jsonBody, { ...resInit, headers: jsonHeaders });
            } else {
                // Cast to any to satisfy the native Response constructor
                // Our HttpResponseBodyInit type is compatible with what Node.js accepts
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                this.#nativeRes = new Response(isNullBodyStatus ? undefined : (init.body as any), resInit);
            }
        }

        this.cookies = init.cookies ?? [];
        this.enableContentNegotiation = !!init.enableContentNegotiation;
    }

    get status(): number {
        return this.#nativeRes.status;
    }

    get headers(): Headers {
        return this.#nativeRes.headers;
    }

    get body(): ReadableStream<any> | null {
        return this.#nativeRes.body;
    }

    get bodyUsed(): boolean {
        return this.#nativeRes.bodyUsed;
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        return this.#nativeRes.arrayBuffer();
    }

    async blob(): Promise<Blob> {
        return this.#nativeRes.blob();
    }

    // eslint-disable-next-line deprecation/deprecation
    async formData(): Promise<FormData> {
        // eslint-disable-next-line deprecation/deprecation
        return this.#nativeRes.formData();
    }

    async json(): Promise<unknown> {
        return this.#nativeRes.json();
    }

    async text(): Promise<string> {
        return this.#nativeRes.text();
    }

    clone(): HttpResponse {
        const newInit = structuredClone(this.#init);
        newInit.nativeResponse = this.#nativeRes.clone();
        return new HttpResponse(newInit);
    }
}
