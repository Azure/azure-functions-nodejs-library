// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { input, output, trigger } from '../src';
import { toCoreFunctionMetadata } from '../src/converters/toCoreFunctionMetadata';
import { InvocationContext } from '../types';

describe('cosmosDBMongo bindings', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handler = (_doc: unknown, _context: InvocationContext) => {};

    const minimalTriggerOptions = {
        connectionStringSetting: 'CosmosDBMongo',
        databaseName: 'MyDatabase',
        collectionName: 'MyCollection',
    };

    // -------------------------------------------------------------------------
    // trigger
    // -------------------------------------------------------------------------

    describe('trigger.cosmosDBMongo', () => {
        it('produces correct type string', () => {
            const trig = trigger.cosmosDBMongo(minimalTriggerOptions);
            expect(trig.type).to.equal('cosmosDBMongoTrigger');
        });

        it('copies all trigger options onto the binding object', () => {
            const trig = trigger.cosmosDBMongo({
                connectionStringSetting: 'CosmosDBMongo',
                databaseName: 'db',
                collectionName: 'coll',
                createIfNotExists: true,
                triggerLevel: 'Database',
                leaseDatabaseName: 'leaseDb',
                leaseCollectionName: 'leases',
                leaseConnectionStringSetting: 'LeaseConn',
                tenantId: 'tenant-abc',
                managedIdentityClientId: 'mi-abc',
                leaseTenantId: 'lease-tenant',
                leaseManagedIdentityClientId: 'lease-mi',
            });
            expect(trig.connectionStringSetting).to.equal('CosmosDBMongo');
            expect(trig.databaseName).to.equal('db');
            expect(trig.collectionName).to.equal('coll');
            expect(trig.createIfNotExists).to.equal(true);
            expect(trig.triggerLevel).to.equal('Database');
            expect(trig.leaseDatabaseName).to.equal('leaseDb');
            expect(trig.leaseCollectionName).to.equal('leases');
            expect(trig.leaseConnectionStringSetting).to.equal('LeaseConn');
            expect(trig.tenantId).to.equal('tenant-abc');
            expect(trig.managedIdentityClientId).to.equal('mi-abc');
            expect(trig.leaseTenantId).to.equal('lease-tenant');
            expect(trig.leaseManagedIdentityClientId).to.equal('lease-mi');
        });

        it('generates a deterministic binding name with Trigger suffix', () => {
            const trig1 = trigger.cosmosDBMongo(minimalTriggerOptions);
            const trig2 = trigger.cosmosDBMongo(minimalTriggerOptions);
            expect(trig1.name).to.equal(trig2.name);
            expect(trig1.name).to.include('cosmosDBMongoTrigger');
        });

        it('sets direction = in via toCoreFunctionMetadata', () => {
            const result = toCoreFunctionMetadata('mongoTrigFunc', {
                handler,
                trigger: trigger.cosmosDBMongo(minimalTriggerOptions),
            });
            const bindingValues = Object.values(result.bindings) as Record<string, unknown>[];
            const trig = bindingValues.find((b) => b['type'] === 'cosmosDBMongoTrigger');
            expect(trig).to.exist;
            expect(trig!['direction']).to.equal('in');
        });
    });

    // -------------------------------------------------------------------------
    // input
    // -------------------------------------------------------------------------

    describe('input.cosmosDBMongo', () => {
        it('produces correct type string', () => {
            const inp = input.cosmosDBMongo({
                connectionStringSetting: 'CosmosDBMongo',
                databaseName: 'db',
                collectionName: 'coll',
            });
            expect(inp.type).to.equal('cosmosDBMongo');
        });

        it('copies all input options onto the binding object', () => {
            const inp = input.cosmosDBMongo({
                connectionStringSetting: 'CosmosDBMongo',
                databaseName: 'db',
                collectionName: 'coll',
                queryString: '{"status": "active"}',
                createIfNotExists: false,
                tenantId: 'tenant-xyz',
                managedIdentityClientId: 'mi-xyz',
            });
            expect(inp.connectionStringSetting).to.equal('CosmosDBMongo');
            expect(inp.databaseName).to.equal('db');
            expect(inp.collectionName).to.equal('coll');
            expect(inp.queryString).to.equal('{"status": "active"}');
            expect(inp.createIfNotExists).to.equal(false);
            expect(inp.tenantId).to.equal('tenant-xyz');
            expect(inp.managedIdentityClientId).to.equal('mi-xyz');
        });

        it('generates a deterministic binding name with Input suffix', () => {
            const inp = input.cosmosDBMongo({
                connectionStringSetting: 'CosmosDBMongo',
                databaseName: 'db',
                collectionName: 'coll',
            });
            expect(inp.name).to.include('Input');
        });

        it('sets direction = in via toCoreFunctionMetadata extra input', () => {
            const inp = input.cosmosDBMongo({
                connectionStringSetting: 'CosmosDBMongo',
                databaseName: 'db',
                collectionName: 'coll',
            });
            const result = toCoreFunctionMetadata('mongoInputFunc', {
                handler: () => {},
                trigger: trigger.cosmosDBMongo(minimalTriggerOptions),
                extraInputs: [inp],
            });
            const bindingValues = Object.values(result.bindings) as Record<string, unknown>[];
            const inputBinding = bindingValues.find((b) => b['type'] === 'cosmosDBMongo' && b['direction'] === 'in');
            expect(inputBinding).to.exist;
        });
    });

    // -------------------------------------------------------------------------
    // output
    // -------------------------------------------------------------------------

    describe('output.cosmosDBMongo', () => {
        it('produces correct type string', () => {
            const out = output.cosmosDBMongo({
                connectionStringSetting: 'CosmosDBMongo',
                databaseName: 'db',
                collectionName: 'coll',
            });
            expect(out.type).to.equal('cosmosDBMongo');
        });

        it('copies all output options onto the binding object', () => {
            const out = output.cosmosDBMongo({
                connectionStringSetting: 'CosmosDBMongo',
                databaseName: 'db',
                collectionName: 'coll',
                createIfNotExists: true,
                tenantId: 'tenant-out',
                managedIdentityClientId: 'mi-out',
            });
            expect(out.connectionStringSetting).to.equal('CosmosDBMongo');
            expect(out.databaseName).to.equal('db');
            expect(out.collectionName).to.equal('coll');
            expect(out.createIfNotExists).to.equal(true);
            expect(out.tenantId).to.equal('tenant-out');
            expect(out.managedIdentityClientId).to.equal('mi-out');
        });

        it('generates a deterministic binding name with Output suffix', () => {
            const out = output.cosmosDBMongo({
                connectionStringSetting: 'CosmosDBMongo',
                databaseName: 'db',
                collectionName: 'coll',
            });
            expect(out.name).to.include('Output');
        });

        it('sets direction = out via toCoreFunctionMetadata extra output', () => {
            const out = output.cosmosDBMongo({
                connectionStringSetting: 'CosmosDBMongo',
                databaseName: 'db',
                collectionName: 'coll',
            });
            const result = toCoreFunctionMetadata('mongoOutputFunc', {
                handler: () => {},
                trigger: trigger.cosmosDBMongo(minimalTriggerOptions),
                extraOutputs: [out],
            });
            const bindingValues = Object.values(result.bindings) as Record<string, unknown>[];
            const outputBinding = bindingValues.find((b) => b['type'] === 'cosmosDBMongo' && b['direction'] === 'out');
            expect(outputBinding).to.exist;
        });
    });
});
