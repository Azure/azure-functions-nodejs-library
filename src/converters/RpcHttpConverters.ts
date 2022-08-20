// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Cookie, HttpResponse } from '@azure/functions';
import { RpcHttpCookie, RpcHttpData, RpcNullableString, RpcTypedData } from '@azure/functions-core';
import { Headers } from 'undici';
import {
    toNullableBool,
    toNullableDouble,
    toNullableString,
    toNullableTimestamp,
    toRpcString,
    toRpcTypedData,
} from './RpcConverters';

export function fromNullableMapping(
    nullableMapping: { [k: string]: RpcNullableString } | null | undefined,
    originalMapping?: { [k: string]: string } | null
): { [key: string]: string } {
    let converted = {};
    if (nullableMapping && Object.keys(nullableMapping).length > 0) {
        for (const key in nullableMapping) {
            converted[key] = nullableMapping[key].value || '';
        }
    } else if (originalMapping && Object.keys(originalMapping).length > 0) {
        converted = <{ [key: string]: string }>originalMapping;
    }
    return converted;
}

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

/**
 * From RFC specifications for 'Set-Cookie' response header: https://www.rfc-editor.org/rfc/rfc6265.txt
 * @param inputCookie
 */
export function toRpcHttpCookie(inputCookie: Cookie): RpcHttpCookie {
    // Resolve RpcHttpCookie.SameSite enum, a one-off
    let rpcSameSite: RpcHttpCookie.SameSite = RpcHttpCookie.SameSite.None;
    if (inputCookie && inputCookie.sameSite) {
        const sameSite = inputCookie.sameSite.toLocaleLowerCase();
        if (sameSite === 'lax') {
            rpcSameSite = RpcHttpCookie.SameSite.Lax;
        } else if (sameSite === 'strict') {
            rpcSameSite = RpcHttpCookie.SameSite.Strict;
        } else if (sameSite === 'none') {
            rpcSameSite = RpcHttpCookie.SameSite.ExplicitNone;
        }
    }

    const rpcCookie: RpcHttpCookie = {
        name: inputCookie && toRpcString(inputCookie.name, 'cookie.name'),
        value: inputCookie && toRpcString(inputCookie.value, 'cookie.value'),
        domain: toNullableString(inputCookie && inputCookie.domain, 'cookie.domain'),
        path: toNullableString(inputCookie && inputCookie.path, 'cookie.path'),
        expires: toNullableTimestamp(inputCookie && inputCookie.expires, 'cookie.expires'),
        secure: toNullableBool(inputCookie && inputCookie.secure, 'cookie.secure'),
        httpOnly: toNullableBool(inputCookie && inputCookie.httpOnly, 'cookie.httpOnly'),
        sameSite: rpcSameSite,
        maxAge: toNullableDouble(inputCookie && inputCookie.maxAge, 'cookie.maxAge'),
    };

    return rpcCookie;
}
