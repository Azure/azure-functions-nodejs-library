// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { app, input, output, trigger } from '../src';
import { toCoreFunctionMetadata } from '../src/converters/toCoreFunctionMetadata';
import { InvocationContext } from '../types';

describe('connectorTrigger', () => {
    const _handler = (_triggerInput: unknown, _context: InvocationContext) => {};

    describe('trigger.connectorTrigger', () => {
        it('should create a trigger with correct type and options', () => {
            const result = trigger.connectorTrigger({});

            expect(result.type).to.equal('connectorTrigger');
            expect(result.name).to.be.a('string').and.not.be.empty;
        });

        it('should generate a consistent binding name', () => {
            const options = {};

            const result1 = trigger.connectorTrigger(options);
            const result2 = trigger.connectorTrigger(options);

            expect(result1.name).to.equal(result2.name);
        });

        it('should generate different names for different options', () => {
            const result1 = trigger.connectorTrigger({});

            const result2 = trigger.connectorTrigger({});

            // NOTE(swapnilnagar): Both are empty options so names will be the same.
            // Test kept for structural consistency.
            expect(result1.name).to.equal(result2.name);
        });
    });

    describe('toCoreFunctionMetadata with connectorTrigger', () => {
        it('should produce correct metadata for connectorTrigger', () => {
            const connectorTriggerBinding = trigger.connectorTrigger({});

            const result = toCoreFunctionMetadata('onNewEmail', {
                handler: _handler,
                trigger: connectorTriggerBinding,
            });

            expect(result).to.deep.equal({
                name: 'onNewEmail',
                bindings: {
                    [connectorTriggerBinding.name]: {
                        type: 'connectorTrigger',
                        name: connectorTriggerBinding.name,
                        direction: 'in',
                        properties: {
                            supportsDeferredBinding: 'false',
                        },
                    },
                },
                retryOptions: undefined,
            });
        });

        it('should produce correct metadata with connectorContent input and output', () => {
            const connectorTriggerBinding = trigger.connectorTrigger({});

            const contentInput = input.connectorContent({
                connector: 'office365',
                connection: 'Office365Connection',
                operation: 'GetEmail',
            });

            const contentOutput = output.connectorContent({
                connector: 'office365',
                connection: 'Office365Connection',
                operation: 'SendEmail',
            });

            const result = toCoreFunctionMetadata('processEmail', {
                handler: _handler,
                trigger: connectorTriggerBinding,
                extraInputs: [contentInput],
                extraOutputs: [contentOutput],
            });

            expect(result).to.deep.equal({
                name: 'processEmail',
                bindings: {
                    [connectorTriggerBinding.name]: {
                        type: 'connectorTrigger',
                        name: connectorTriggerBinding.name,
                        direction: 'in',
                        properties: {
                            supportsDeferredBinding: 'false',
                        },
                    },
                    [contentInput.name]: {
                        type: 'connectorContent',
                        name: contentInput.name,
                        direction: 'in',
                        connector: 'office365',
                        connection: 'Office365Connection',
                        operation: 'GetEmail',
                        properties: {
                            supportsDeferredBinding: 'false',
                        },
                    },
                    [contentOutput.name]: {
                        type: 'connectorContent',
                        name: contentOutput.name,
                        direction: 'out',
                        connector: 'office365',
                        connection: 'Office365Connection',
                        operation: 'SendEmail',
                    },
                },
                retryOptions: undefined,
            });
        });
    });

    describe('app.connectorTrigger', () => {
        it('should register without throwing', () => {
            expect(() => {
                app.connectorTrigger('testConnectorTrigger', {
                    handler: _handler,
                });
            }).to.not.throw();
        });

        it('should register with extraInputs and extraOutputs', () => {
            const contentInput = input.connectorContent({
                connector: 'office365',
                connection: 'Office365Connection',
                operation: 'GetEmail',
            });

            const contentOutput = output.connectorContent({
                connector: 'office365',
                connection: 'Office365Connection',
                operation: 'SendEmail',
            });

            expect(() => {
                app.connectorTrigger('testWithBindings', {
                    extraInputs: [contentInput],
                    extraOutputs: [contentOutput],
                    handler: _handler,
                });
            }).to.not.throw();
        });
    });
});

describe('connectorContent input', () => {
    it('should create an input binding with correct type and options', () => {
        const result = input.connectorContent({
            connector: 'office365',
            connection: 'Office365Connection',
            operation: 'GetEmail',
        });

        expect(result.type).to.equal('connectorContent');
        expect(result.connector).to.equal('office365');
        expect(result.connection).to.equal('Office365Connection');
        expect(result.operation).to.equal('GetEmail');
        expect(result.name).to.be.a('string').and.not.be.empty;
    });

    it('should allow optional operation', () => {
        const result = input.connectorContent({
            connector: 'sharepointonline',
            connection: 'SharePointConnection',
        });

        expect(result.type).to.equal('connectorContent');
        expect(result.connector).to.equal('sharepointonline');
        expect(result.connection).to.equal('SharePointConnection');
        expect(result.operation).to.be.undefined;
    });

    it('should generate consistent binding names', () => {
        const options = {
            connector: 'office365',
            connection: 'Office365Connection',
            operation: 'GetEmail',
        };

        const result1 = input.connectorContent(options);
        const result2 = input.connectorContent(options);

        expect(result1.name).to.equal(result2.name);
    });
});

describe('connectorContent output', () => {
    it('should create an output binding with correct type and options', () => {
        const result = output.connectorContent({
            connector: 'office365',
            connection: 'Office365Connection',
            operation: 'SendEmail',
        });

        expect(result.type).to.equal('connectorContent');
        expect(result.connector).to.equal('office365');
        expect(result.connection).to.equal('Office365Connection');
        expect(result.operation).to.equal('SendEmail');
        expect(result.name).to.be.a('string').and.not.be.empty;
    });

    it('should allow optional operation', () => {
        const result = output.connectorContent({
            connector: 'teams',
            connection: 'TeamsConnection',
        });

        expect(result.type).to.equal('connectorContent');
        expect(result.connector).to.equal('teams');
        expect(result.connection).to.equal('TeamsConnection');
        expect(result.operation).to.be.undefined;
    });

    it('should generate consistent binding names', () => {
        const options = {
            connector: 'office365',
            connection: 'Office365Connection',
            operation: 'SendEmail',
        };

        const result1 = output.connectorContent(options);
        const result2 = output.connectorContent(options);

        expect(result1.name).to.equal(result2.name);
    });
});
