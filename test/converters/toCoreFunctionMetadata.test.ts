// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { output, trigger } from '../../src';
import { toCoreFunctionMetadata } from '../../src/converters/toCoreFunctionMetadata';

describe('toCoreFunctionMetadata', () => {
    const handler = () => {};
    const expectedHttpTrigger = {
        authLevel: 'anonymous',
        methods: ['GET', 'POST'],
        type: 'httpTrigger',
        name: 'httpTrigger433d175fc9',
        direction: 'in',
    };
    const expectedHttpOutput = { type: 'http', name: 'httpOutput9a706511b1', direction: 'out' };
    const expectedQueueOutput1 = {
        queueName: 'e2e-test-queue-trigger',
        connection: 'e2eTest_storage',
        type: 'queue',
        name: 'queueOutput8b95495f3d',
        direction: 'out',
    };

    it('http trigger', () => {
        const result = toCoreFunctionMetadata('funcName', {
            handler,
            trigger: trigger.http({}),
            return: output.http({}),
        });
        expect(result).to.deep.equal({
            name: 'funcName',
            bindings: {
                httpTrigger433d175fc9: expectedHttpTrigger,
                $return: expectedHttpOutput,
            },
            retryOptions: undefined,
        });
    });

    it('http trigger, storage output', () => {
        const result = toCoreFunctionMetadata('funcName', {
            handler,
            trigger: trigger.http({}),
            return: output.http({}),
            extraOutputs: [
                output.storageQueue({
                    queueName: 'e2e-test-queue-trigger',
                    connection: 'e2eTest_storage',
                }),
            ],
        });
        expect(result).to.deep.equal({
            name: 'funcName',
            bindings: {
                httpTrigger433d175fc9: expectedHttpTrigger,
                $return: expectedHttpOutput,
                queueOutput8b95495f3d: expectedQueueOutput1,
            },
            retryOptions: undefined,
        });
    });

    it('http trigger, multiple storage output', () => {
        const result = toCoreFunctionMetadata('funcName', {
            handler,
            trigger: trigger.http({}),
            return: output.http({}),
            extraOutputs: [
                output.storageQueue({
                    queueName: 'e2e-test-queue-trigger',
                    connection: 'e2eTest_storage',
                }),
                output.storageQueue({
                    queueName: 'e2e-test-queue-trigger2',
                    connection: 'e2eTest_storage',
                }),
            ],
        });
        expect(result).to.deep.equal({
            name: 'funcName',
            bindings: {
                httpTrigger433d175fc9: expectedHttpTrigger,
                $return: expectedHttpOutput,
                queueOutput8b95495f3d: expectedQueueOutput1,
                queueOutput7ab7ce64ad: {
                    queueName: 'e2e-test-queue-trigger2',
                    connection: 'e2eTest_storage',
                    type: 'queue',
                    name: 'queueOutput7ab7ce64ad',
                    direction: 'out',
                },
            },
            retryOptions: undefined,
        });
    });

    it('http trigger, duplicate storage output', () => {
        expect(() => {
            toCoreFunctionMetadata('funcName', {
                handler,
                trigger: trigger.http({}),
                return: output.http({}),
                extraOutputs: [
                    output.storageQueue({
                        queueName: 'e2e-test-queue-trigger',
                        connection: 'e2eTest_storage',
                    }),
                    output.storageQueue({
                        queueName: 'e2e-test-queue-trigger',
                        connection: 'e2eTest_storage',
                    }),
                ],
            });
        }).to.throw(/duplicate bindings found/i);
    });

    it('http trigger, duplicate storage output with name workaround', () => {
        const result = toCoreFunctionMetadata('funcName', {
            handler,
            trigger: trigger.http({}),
            return: output.http({}),
            extraOutputs: [
                output.storageQueue({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    name: 'notADupe',
                    queueName: 'e2e-test-queue-trigger',
                    connection: 'e2eTest_storage',
                }),
                output.storageQueue({
                    queueName: 'e2e-test-queue-trigger',
                    connection: 'e2eTest_storage',
                }),
            ],
        });

        expect(result).to.deep.equal({
            name: 'funcName',
            bindings: {
                httpTrigger433d175fc9: expectedHttpTrigger,
                $return: expectedHttpOutput,
                queueOutput8b95495f3d: expectedQueueOutput1,
                notADupe: {
                    queueName: 'e2e-test-queue-trigger',
                    connection: 'e2eTest_storage',
                    type: 'queue',
                    name: 'notADupe',
                    direction: 'out',
                },
            },
            retryOptions: undefined,
        });
    });
});
