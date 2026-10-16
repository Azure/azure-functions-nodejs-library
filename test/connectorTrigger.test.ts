// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { app, trigger } from '../src';
import { fromRpcTypedData } from '../src/converters/fromRpcTypedData';
import { toCoreFunctionMetadata } from '../src/converters/toCoreFunctionMetadata';
import { ConnectorTriggerFunctionOptions, ConnectorTriggerOptions, InvocationContext } from '../types';

describe('connectorTrigger', () => {
    const _handler = (_triggerInput: unknown, _context: InvocationContext) => {};

    describe('trigger.connectorTrigger', () => {
        const pollOptions: ConnectorTriggerOptions = {
            deliveryMode: 'Poll',
            connection: 'ConnectorNamespace',
            triggerConfigName: '%OnNewEmailTriggerConfigName%',
        };

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

        it('should generate a stable binding name for equivalent options', () => {
            const result1 = trigger.connectorTrigger({});

            const result2 = trigger.connectorTrigger({});

            expect(result1.name).to.equal(result2.name);
        });

        it('should preserve all polling options and custom properties', () => {
            const options: ConnectorTriggerOptions = {
                ...pollOptions,
                cardinality: 'many',
                maxBatchSize: 10,
                maxConcurrentCalls: 2,
                targetPendingEventThreshold: 16,
                customField: 'custom',
            };

            expect(trigger.connectorTrigger(options)).to.include(options);
        });

        it('should leave optional polling settings omitted so the host supplies defaults', () => {
            const result = trigger.connectorTrigger(pollOptions);

            expect(result).to.have.all.keys('name', 'type', 'deliveryMode', 'connection', 'triggerConfigName');
        });

        it('should leave the default delivery mode omitted', () => {
            expect(trigger.connectorTrigger({})).to.have.all.keys('name', 'type');
        });

        it('should accept Webhook without polling settings', () => {
            expect(trigger.connectorTrigger({ deliveryMode: 'Webhook' })).to.include({ deliveryMode: 'Webhook' });
        });

        for (const key of ['connection', 'triggerConfigName']) {
            for (const value of [undefined, null]) {
                it(`should require ${key} in Poll mode when it is ${String(value)}`, () => {
                    expect(() => trigger.connectorTrigger({ ...pollOptions, [key]: value })).to.throw(key);
                });
            }
        }

        it('should report all missing Poll settings', () => {
            expect(() => trigger.connectorTrigger({ deliveryMode: 'Poll' })).to.throw(
                'The following options are required for Poll delivery mode: connection, triggerConfigName'
            );
        });

        it('should preserve zero values without adding numeric restrictions', () => {
            const options: ConnectorTriggerOptions = {
                ...pollOptions,
                maxBatchSize: 0,
                maxConcurrentCalls: 0,
                targetPendingEventThreshold: 0,
            };

            expect(trigger.connectorTrigger(options)).to.include(options);
        });

        for (const key of ['maxBatchSize', 'maxConcurrentCalls']) {
            it(`should allow ${key} to be overridden independently`, () => {
                const options = { ...pollOptions, [key]: 2 };

                expect(trigger.connectorTrigger(options)).to.include(options);
            });
        }
    });

    describe('toCoreFunctionMetadata with connectorTrigger', () => {
        for (const cardinality of ['one', 'many'] as const) {
            it(`should serialize Poll metadata with cardinality ${cardinality}`, () => {
                const options: ConnectorTriggerOptions = {
                    deliveryMode: 'Poll',
                    connection: 'ConnectorNamespace',
                    triggerConfigName: '%OnNewEmailTriggerConfigName%',
                    cardinality,
                    maxBatchSize: 10,
                    maxConcurrentCalls: 2,
                    targetPendingEventThreshold: 16,
                    customField: 'custom',
                };
                const binding = trigger.connectorTrigger(options);
                const result = toCoreFunctionMetadata('onNewEmail', { handler: _handler, trigger: binding });

                expect(result.bindings[binding.name]).to.deep.equal({
                    ...options,
                    name: binding.name,
                    type: 'connectorTrigger',
                    direction: 'in',
                    properties: { supportsDeferredBinding: 'false' },
                });
            });
        }

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
    });

    describe('app.connectorTrigger', () => {
        it('should register a typed batch handler with polling settings', () => {
            const options: ConnectorTriggerFunctionOptions<string[]> = {
                deliveryMode: 'Poll',
                connection: 'ConnectorNamespace',
                triggerConfigName: 'config',
                cardinality: 'many',
                handler: (events, context) => {
                    context.log(events.join(', '));
                },
            };

            expect(() => app.connectorTrigger<string[]>('pollConnectorTrigger', options)).to.not.throw();
        });

        it('should validate polling settings during registration', () => {
            expect(() =>
                app.connectorTrigger('invalidPollConnectorTrigger', { deliveryMode: 'Poll', handler: _handler })
            ).to.throw('connection, triggerConfigName');
        });

        it('should register without throwing', () => {
            expect(() => {
                app.connectorTrigger('testConnectorTrigger', {
                    handler: _handler,
                });
            }).to.not.throw();
        });
    });

    describe('polling batch payloads', () => {
        it('should decode string batches using existing Node.js JSON conversion', () => {
            expect(fromRpcTypedData({ collectionString: { string: ['{"id":"first"}', 'second'] } })).to.deep.equal([
                { id: 'first' },
                'second',
            ]);
        });

        it('should decode byte batches as Buffers', () => {
            expect(fromRpcTypedData({ collectionBytes: { bytes: [Buffer.from('first')] } })).to.deep.equal([
                Buffer.from('first'),
            ]);
        });

        it('should decode empty batches', () => {
            expect(fromRpcTypedData({ collectionString: { string: [] } })).to.deep.equal([]);
            expect(fromRpcTypedData({ collectionBytes: { bytes: [] } })).to.deep.equal([]);
        });
    });
});
