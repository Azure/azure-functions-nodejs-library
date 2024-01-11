// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HttpResponseInit } from '@azure/functions';
import { Blob } from 'buffer';
import { ReadableStream } from 'stream/web';
import { FormData, Headers, Response as uResponse, ResponseInit as uResponseInit } from 'undici';
import { isDefined } from '../utils/nonNull';

interface InternalHttpResponseInit extends HttpResponseInit {
    undiciResponse?: uResponse;
}

export class HttpResponse implements types.HttpResponse {
    readonly cookies: types.Cookie[];
    readonly enableContentNegotiation: boolean;

    #uRes: uResponse;
    #init: InternalHttpResponseInit;

    constructor(init?: InternalHttpResponseInit) {
        init ??= {};
        this.#init = init;

        if (init.undiciResponse) {
            this.#uRes = init.undiciResponse;
        } else {
            const uResInit: uResponseInit = { status: init.status, headers: init.headers };
            if (isDefined(init.jsonBody)) {
                this.#uRes = uResponse.json(init.jsonBody, uResInit);
            } else {
                this.#uRes = new uResponse(init.body, uResInit);
            }
        }

        this.cookies = init.cookies ?? [];
        this.enableContentNegotiation = !!init.enableContentNegotiation;
    }

    get status(): number {
        return this.#uRes.status;
    }

    get headers(): Headers {
        return this.#uRes.headers;
    }

    get body(): ReadableStream<any> | null {
        return this.#uRes.body;
    }

    get bodyUsed(): boolean {
        return this.#uRes.bodyUsed;
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        return this.#uRes.arrayBuffer();
    }

    async blob(): Promise<Blob> {
        return this.#uRes.blob();
    }

    async formData(): Promise<FormData> {
        return this.#uRes.formData();
    }

    async json(): Promise<unknown> {
        return this.#uRes.json();
    }

    async text(): Promise<string> {
        return this.#uRes.text();
    }

    clone(): HttpResponse {
        const newInit = structuredClone(this.#init);
        newInit.undiciResponse = this.#uRes.clone();
        return new HttpResponse(newInit);
    }
}
