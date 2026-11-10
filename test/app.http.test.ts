// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { FunctionMetadata } from '@azure/functions-core';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as app from '../src/app';
import * as tryGetCoreApiLazyModule from '../src/utils/tryGetCoreApiLazy';
import { HttpHandler, HttpMethodFunctionOptions } from '../types';

describe('app.query', () => {
    const handler: HttpHandler = () => ({ body: 'results' });
    const registerFunction = sinon.stub();

    beforeEach(() => {
        registerFunction.reset();
        sinon.stub(tryGetCoreApiLazyModule, 'tryGetCoreApiLazy').returns({
            registerFunction,
            setProgrammingModel: sinon.stub(),
        } as unknown as ReturnType<typeof tryGetCoreApiLazyModule.tryGetCoreApiLazy>);
    });

    afterEach(() => {
        sinon.restore();
    });

    for (const useOptions of [false, true]) {
        it(`registers QUERY with ${useOptions ? 'options' : 'a handler'}`, () => {
            const options: HttpMethodFunctionOptions = {
                handler,
                route: 'search',
                authLevel: 'function',
            };
            app.query('queryFn', useOptions ? options : handler);

            sinon.assert.calledOnce(registerFunction);
            const [metadata, callback] = registerFunction.firstCall.args as [FunctionMetadata, HttpHandler];
            expect(metadata.name).to.equal('queryFn');
            const binding = Object.values(metadata.bindings).find((b) => b.type === 'httpTrigger');
            expect(binding).to.deep.include({
                methods: ['QUERY'],
                authLevel: useOptions ? 'function' : 'anonymous',
            });
            if (useOptions) {
                expect(binding).to.include({ route: 'search' });
            } else {
                expect(binding).not.to.have.property('route');
            }
            expect(metadata.bindings.$return?.type).to.equal('http');
            expect(callback).to.equal(handler);
        });
    }

    it('preserves QUERY alongside other methods in app.http', () => {
        app.http('mixedFn', { methods: ['GET', 'QUERY'], handler });

        sinon.assert.calledOnce(registerFunction);
        const metadata = registerFunction.firstCall.args[0] as FunctionMetadata;
        const binding = Object.values(metadata.bindings).find((b) => b.type === 'httpTrigger');
        expect(binding).to.deep.include({ methods: ['GET', 'QUERY'] });
    });
});
