// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { HttpResponse } from '@azure/functions';
import { RpcHttpData, RpcTypedData } from '@azure/functions-core';
import { Headers } from 'undici';
import { toRpcHttpCookie } from './toRpcHttpCookie';
import { toRpcTypedData } from './toRpcTypedData';

export function toRpcHttp(data: unknown): RpcTypedData | null | undefined {
    if (data === null || data === undefined) {
        return data;
    } else if (typeof data !== 'object') {
        throw new Error(
            'The HTTP response must be an object with optional properties "body", "status", "headers", and "cookies".'
        );
    }
    const response: HttpResponse = data;

    const rpcResponse: RpcHttpData = {};
    rpcResponse.body = toRpcTypedData(response.body);
    rpcResponse.statusCode = response.status?.toString();

    rpcResponse.headers = {};
    const headers = new Headers(response.headers);
    for (const [key, value] of headers.entries()) {
        rpcResponse.headers[key] = value;
    }

    if (response.cookies) {
        rpcResponse.cookies = [];
        for (const cookie of response.cookies) {
            rpcResponse.cookies.push(toRpcHttpCookie(cookie));
        }
    }

    return { http: rpcResponse };
}
