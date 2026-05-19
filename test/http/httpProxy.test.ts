// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { isAllowedProxyResponseHeader } from '../../src/http/httpProxy';

describe('Http proxy', () => {
    it('Blocks hop-by-hop response headers', () => {
        const blockedHeaders = [
            'connection',
            'keep-alive',
            'proxy-authenticate',
            'proxy-authorization',
            'te',
            'trailer',
            'transfer-encoding',
            'upgrade',
            'content-length',
        ];

        for (const header of blockedHeaders) {
            expect(isAllowedProxyResponseHeader(header), header).to.be.false;
            expect(isAllowedProxyResponseHeader(header.toUpperCase()), header).to.be.false;
        }
    });

    it('Allows end-to-end response headers', () => {
        const allowedHeaders = ['content-type', 'cache-control', 'set-cookie', 'x-frame-options'];

        for (const header of allowedHeaders) {
            expect(isAllowedProxyResponseHeader(header), header).to.be.true;
        }
    });
});
