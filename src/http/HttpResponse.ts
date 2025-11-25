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
            if (isDefined(init.jsonBody)) {
                // Response.json is not available in all versions, so we create it manually
                const jsonBody = JSON.stringify(init.jsonBody);
                const jsonHeaders = new Headers(resInit.headers);
                if (!jsonHeaders.has('content-type')) {
                    jsonHeaders.set('content-type', 'application/json');
                }
                this.#nativeRes = new Response(jsonBody, { ...resInit, headers: jsonHeaders });
            } else {
                this.#nativeRes = new Response(init.body, resInit);
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
        return this.#nativeRes.body as ReadableStream<any> | null;
    }

    get bodyUsed(): boolean {
        return this.#nativeRes.bodyUsed;
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        return this.#nativeRes.arrayBuffer();
    }

    async blob(): Promise<Blob> {
        return this.#nativeRes.blob() as Promise<Blob>;
    }

    async formData(): Promise<FormData> {
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
