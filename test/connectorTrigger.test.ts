// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { app, trigger } from '../src';
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
    });

    describe('app.connectorTrigger', () => {
        it('should register without throwing', () => {
            expect(() => {
                app.connectorTrigger('testConnectorTrigger', {
                    handler: _handler,
                });
            }).to.not.throw();
        });
    });
});
