// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Cookie } from '@azure/functions';
import { RpcHttpCookie } from '@azure/functions-core';
import { toNullableBool, toNullableDouble, toNullableString, toNullableTimestamp, toRpcString } from './toRpcNullable';

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
