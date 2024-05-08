// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcHttpData, RpcTypedData } from '@azure/functions-core';
import { AzFuncSystemError } from '../errors';
import { sendProxyResponse } from '../http/httpProxy';
import { HttpResponse } from '../http/HttpResponse';
import { enableHttpStream } from '../setup';
import { toRpcHttpCookie } from './toRpcHttpCookie';
import { toRpcTypedData } from './toRpcTypedData';

export async function toRpcHttp(invocationId: string, data: unknown): Promise<RpcTypedData | null | undefined> {
    if (data === null || data === undefined) {
        return data;
    } else if (typeof data !== 'object') {
        throw new AzFuncSystemError(
            'The HTTP response must be an object with optional properties "body", "status", "headers", and "cookies".'
        );
    }

    const response = data instanceof HttpResponse ? data : new HttpResponse(data);
    if (enableHttpStream) {
        // send http data over http proxy instead of rpc
        await sendProxyResponse(invocationId, response);
        return;
    }

    const rpcResponse: RpcHttpData = {};
    rpcResponse.statusCode = response.status.toString();

    rpcResponse.headers = {};
    for (const [key, value] of response.headers.entries()) {
        rpcResponse.headers[key] = value;
    }

    rpcResponse.cookies = [];
    for (const cookie of response.cookies) {
        rpcResponse.cookies.push(toRpcHttpCookie(cookie));
    }

    rpcResponse.enableContentNegotiation = response.enableContentNegotiation;

    const bodyBytes = await response.arrayBuffer();
    rpcResponse.body = toRpcTypedData(bodyBytes);

    return { http: rpcResponse };
}
