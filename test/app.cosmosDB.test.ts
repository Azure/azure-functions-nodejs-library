// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { RpcBindingInfo } from '@azure/functions-core';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CosmosDBv4ChangeFeedMode as RuntimeCosmosDBv4ChangeFeedMode } from '../src';
import * as app from '../src/app';
import * as tryGetCoreApiLazyModule from '../src/utils/tryGetCoreApiLazy';
import { CosmosDBv4ChangeFeedMode, InvocationContext } from '../types';

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
            changeFeedMode:
                RuntimeCosmosDBv4ChangeFeedMode.AllVersionsAndDeletes as unknown as CosmosDBv4ChangeFeedMode.AllVersionsAndDeletes,
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
