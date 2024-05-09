// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { capabilities, enableHttpStream, setup } from '../src/setup';

describe('setup', () => {
    it('enableHttpStream', () => {
        // default
        expect(enableHttpStream).to.equal(false);

        // set to true
        setup({ enableHttpStream: true });
        expect(enableHttpStream).to.equal(true);

        // don't change if not explicitly set
        setup({});
        expect(enableHttpStream).to.equal(true);
        setup({ capabilities: {} });
        expect(enableHttpStream).to.equal(true);

        // set to true
        setup({ enableHttpStream: false });
        expect(enableHttpStream).to.equal(false);
    });

    it('capabilities', () => {
        // default
        expect(capabilities).to.deep.equal({});

        // various setting & merging without replacing
        setup({ capabilities: { a: '1' } });
        expect(capabilities).to.deep.equal({ a: '1' });
        setup({});
        expect(capabilities).to.deep.equal({ a: '1' });
        setup({ capabilities: { b: '2' } });
        expect(capabilities).to.deep.equal({ a: '1', b: '2' });
        setup({ capabilities: { a: '3' } });
        expect(capabilities).to.deep.equal({ a: '3', b: '2' });

        // boolean converted to string
        setup({ capabilities: { c: true } });
        expect(capabilities).to.deep.equal({ a: '3', b: '2', c: 'true' });
    });
});
