// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Cookie } from '@azure/functions';
import { expect } from 'chai';
import 'mocha';
import { toRpcHttpCookie } from '../../src/converters/toRpcHttpCookie';

describe('toRpcHttpCookie', () => {
    it('http cookies', () => {
        const cookieInputs: Cookie[] = [
            {
                name: 'mycookie',
                value: 'myvalue',
                maxAge: 200000,
            },
            <any>{
                name: 'mycookie2',
                value: 'myvalue2',
                path: '/',
                maxAge: '200000',
            },
            {
                name: 'mycookie3-expires',
                value: 'myvalue3-expires',
                expires: new Date('December 17, 1995 03:24:00 PST'),
            },
        ];

        const rpcCookies = cookieInputs.map(toRpcHttpCookie);
        expect(rpcCookies[0].name).to.equal('mycookie');
        expect(rpcCookies[0].value).to.equal('myvalue');
        expect((<any>rpcCookies[0].maxAge).value).to.equal(200000);

        expect(rpcCookies[1].name).to.equal('mycookie2');
        expect(rpcCookies[1].value).to.equal('myvalue2');
        expect((<any>rpcCookies[1].path).value).to.equal('/');
        expect((<any>rpcCookies[1].maxAge).value).to.equal(200000);

        expect(rpcCookies[2].name).to.equal('mycookie3-expires');
        expect(rpcCookies[2].value).to.equal('myvalue3-expires');
        expect((<any>rpcCookies[2].expires).value.seconds).to.equal(819199440);
    });

    it('http cookie SameSite', () => {
        const cookieInputs: Cookie[] = [
            {
                name: 'none-cookie',
                value: 'myvalue',
                sameSite: 'None',
            },
            {
                name: 'lax-cookie',
                value: 'myvalue',
                sameSite: 'Lax',
            },
            {
                name: 'strict-cookie',
                value: 'myvalue',
                sameSite: 'Strict',
            },
            {
                name: 'default-cookie',
                value: 'myvalue',
            },
        ];

        const rpcCookies = cookieInputs.map(toRpcHttpCookie);
        expect(rpcCookies[0].name).to.equal('none-cookie');
        expect(rpcCookies[0].sameSite).to.equal('explicitNone');

        expect(rpcCookies[1].name).to.equal('lax-cookie');
        expect(rpcCookies[1].sameSite).to.equal('lax');

        expect(rpcCookies[2].name).to.equal('strict-cookie');
        expect(rpcCookies[2].sameSite).to.equal('strict');

        expect(rpcCookies[3].name).to.equal('default-cookie');
        expect(rpcCookies[3].sameSite).to.equal('none');
    });

    it('throws on invalid input', () => {
        expect(() => {
            const cookieInputs: any[] = [
                {
                    name: 123,
                    value: 'myvalue',
                    maxAge: 200000,
                },
                {
                    name: 'mycookie2',
                    value: 'myvalue2',
                    path: '/',
                    maxAge: '200000',
                },
                {
                    name: 'mycookie3-expires',
                    value: 'myvalue3-expires',
                    expires: new Date('December 17, 1995 03:24:00'),
                },
                {
                    name: 'mycookie3-expires',
                    value: 'myvalue3-expires',
                    expires: new Date(''),
                },
            ];

            cookieInputs.map(toRpcHttpCookie);
        }).to.throw('');
    });
});
