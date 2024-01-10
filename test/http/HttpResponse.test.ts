// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { HttpResponse } from '../../src/http/HttpResponse';

chai.use(chaiAsPromised);

describe('HttpResponse', () => {
    it('clone', async () => {
        const res = new HttpResponse({
            body: 'body1',
            headers: {
                a: 'b',
            },
            cookies: [
                {
                    name: 'name1',
                    value: 'value1',
                },
            ],
        });
        const res2 = res.clone();
        expect(await res.text()).to.equal('body1');
        expect(await res2.text()).to.equal('body1');
        expect(res.headers).to.not.equal(res2.headers);
        expect(res.headers).to.deep.equal(res2.headers);
        expect(res.cookies).to.not.equal(res2.cookies);
        expect(res.cookies).to.deep.equal(res2.cookies);
    });
});
