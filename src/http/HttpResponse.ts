// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HttpResponseInit } from '@azure/functions';
import { Blob } from 'buffer';
import { ReadableStream } from 'stream/web';
import { isDefined } from '../utils/nonNull';

interface InternalHttpResponseInit extends HttpResponseInit {
    response?: Response;
}

export class HttpResponse implements types.HttpResponse {
    readonly cookies: types.Cookie[];
    readonly enableContentNegotiation: boolean;

    #res: Response;
    #init: InternalHttpResponseInit;

    constructor(init?: InternalHttpResponseInit) {
        init ??= {};
        this.#init = init;

        if (init.response) {
            this.#res = init.response;
        } else {
            const resInit: ResponseInit = { status: init.status, headers: init.headers };
            if (isDefined(init.jsonBody)) {
                // Create JSON response manually for compatibility
                const jsonHeaders = new Headers(resInit.headers);
                if (!jsonHeaders.has('content-type')) {
                    jsonHeaders.set('content-type', 'application/json');
                }
                this.#res = new Response(JSON.stringify(init.jsonBody), {
                    ...resInit,
                    headers: jsonHeaders,
                });
            } else {
                this.#res = new Response(init.body, resInit);
            }
        }

        this.cookies = init.cookies ?? [];
        this.enableContentNegotiation = !!init.enableContentNegotiation;
    }

    get status(): number {
        return this.#res.status;
    }

    get headers(): Headers {
        return this.#res.headers;
    }

    get body(): ReadableStream<Uint8Array> | null {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.#res.body as any; // Type compatibility between global and Node.js ReadableStream
    }

    get bodyUsed(): boolean {
        return this.#res.bodyUsed;
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        return this.#res.arrayBuffer();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async blob(): Promise<Blob> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.#res.blob() as any; // Type compatibility with Node.js Blob
    }

    async formData(): Promise<FormData> {
        return this.#res.formData();
    }

    async json(): Promise<unknown> {
        return this.#res.json();
    }

    async text(): Promise<string> {
        return this.#res.text();
    }

    clone(): HttpResponse {
        const newInit = structuredClone(this.#init);
        newInit.response = this.#res.clone();
        return new HttpResponse(newInit);
    }
}
