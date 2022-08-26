// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { HttpResponse } from '@azure/functions';
import { RpcHttpData, RpcTypedData } from '@azure/functions-core';
import { Headers } from 'undici';
import { AzFuncSystemError } from '../errors';
import { toRpcHttpCookie } from './toRpcHttpCookie';
import { toRpcTypedData } from './toRpcTypedData';

export function toRpcHttp(data: unknown): RpcTypedData | null | undefined {
    if (data === null || data === undefined) {
        return data;
    } else if (typeof data !== 'object') {
        throw new AzFuncSystemError(
            'The HTTP response must be an object with optional properties "body", "status", "headers", and "cookies".'
        );
    }
    const response: HttpResponse = data;

    const rpcResponse: RpcHttpData = {};
    rpcResponse.body = toRpcTypedData(response.body);
    if (response.status !== null && response.status !== undefined) {
        if (typeof response.status !== 'string' && typeof response.status !== 'number') {
            throw new AzFuncSystemError('The HTTP response "status" property must be of type "number" or "string".');
        } else {
            rpcResponse.statusCode = response.status.toString();
        }
    }

    rpcResponse.headers = {};
    if (response.headers !== null && response.headers !== undefined) {
        const headers = new Headers(response.headers);
        for (const [key, value] of headers.entries()) {
            rpcResponse.headers[key] = value;
        }
    }

    rpcResponse.cookies = [];
    if (response.cookies !== null && response.cookies !== undefined) {
        for (const cookie of response.cookies) {
            rpcResponse.cookies.push(toRpcHttpCookie(cookie));
        }
    }

    return { http: rpcResponse };
}
