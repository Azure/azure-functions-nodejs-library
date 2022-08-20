// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { HttpRequestUser } from '@azure/functions';
import { Headers } from 'undici';
import { nonNullValue } from '../utils/nonNull';

/* grandfathered in. Should fix when possible */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */

export function extractHttpUserFromHeaders(headers: Headers): HttpRequestUser | null {
    let user: HttpRequestUser | null = null;

    const clientPrincipal = headers.get('x-ms-client-principal');
    if (clientPrincipal) {
        const claimsPrincipalData = JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('utf-8'));

        if (claimsPrincipalData['identityProvider']) {
            user = {
                type: 'StaticWebApps',
                id: claimsPrincipalData['userId'],
                username: claimsPrincipalData['userDetails'],
                identityProvider: claimsPrincipalData['identityProvider'],
                claimsPrincipalData,
            };
        } else {
            user = {
                type: 'AppService',
                id: nonNullValue(headers.get('x-ms-client-principal-id'), 'user-id'),
                username: nonNullValue(headers.get('x-ms-client-principal-name'), 'user-name'),
                identityProvider: nonNullValue(headers.get('x-ms-client-principal-idp'), 'user-idp'),
                claimsPrincipalData,
            };
        }
    }

    return user;
}
