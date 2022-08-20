// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import 'mocha';
import { toRpcHttp } from '../../src/converters/toRpcHttp';

describe('toRpcHttp', () => {
    it('throws on string as http response', () => {
        expect(() => {
            toRpcHttp('My output string');
        }).to.throw(
            'The HTTP response must be an object with optional properties "body", "status", "headers", and "cookies".'
        );
    });
});
