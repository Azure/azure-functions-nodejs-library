// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as app from '../src/app';
import * as tryGetCoreApiLazyModule from '../src/utils/tryGetCoreApiLazy';
import { RpcBindingInfo } from '@azure/functions-core';
import { InvocationContext } from '../types';

describe('app.cosmosDB', () => {
    const handler = (_documents: unknown[], _context: InvocationContext) => {};

    afterEach(() => {
        sinon.restore();
    });

    it('registers changeFeedMode on function metadata', () => {
        const registerFunction = sinon.stub();
        const setProgrammingModel = sinon.stub();

        sinon.stub(tryGetCoreApiLazyModule, 'tryGetCoreApiLazy').returns({
            registerFunction,
            setProgrammingModel,
        } as unknown as ReturnType<typeof tryGetCoreApiLazyModule.tryGetCoreApiLazy>);

        app.cosmosDB('cosmosFn', {
            handler,
            connection: 'CosmosConnection',
            databaseName: 'dbName',
            containerName: 'containerName',
            changeFeedMode: 'AllVersionsAndDeletes',
        });

        sinon.assert.calledOnce(registerFunction);
        const metadata = registerFunction.firstCall.args[0];

        expect(metadata.name).to.equal('cosmosFn');
        const cosmosBinding = Object.values(metadata.bindings as Record<string, RpcBindingInfo>).find(
            (b) => b.type === 'cosmosDBTrigger'
        );
        expect(cosmosBinding).to.include({
            connection: 'CosmosConnection',
            databaseName: 'dbName',
            containerName: 'containerName',
            changeFeedMode: 'AllVersionsAndDeletes',
        });
    });
});
