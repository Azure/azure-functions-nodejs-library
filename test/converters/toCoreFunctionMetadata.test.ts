// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { output, trigger } from '../../src';
import { toCoreFunctionMetadata } from '../../src/converters/toCoreFunctionMetadata';
import { InvocationContext } from '../../types';

describe('toCoreFunctionMetadata', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handler = (blob: Buffer, context: InvocationContext) => {};
    const expectedHttpTrigger = {
        authLevel: 'anonymous',
        methods: ['GET', 'POST'],
        type: 'httpTrigger',
        name: 'httpTrigger433d175fc9',
        direction: 'in',
        properties: {
            supportsDeferredBinding: 'false',
        },
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

describe('toCoreFunctionMetadata deferred binding tests', () => {
    const handler = () => {}; // Mock handler function

    it('should set supportsDeferredBinding to true for blob trigger when deferredBinding is true', () => {
        const result = toCoreFunctionMetadata('blobFunction', {
            handler,
            trigger: {
                ...trigger.storageBlob({
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    deferredBinding: true,
                }),
            },
            return: output.http({}),
        });

        expect(result).to.deep.include({
            name: 'blobFunction',
            bindings: {
                blobTriggerb6f7d01f70: {
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    deferredBinding: true,
                    type: 'blobTrigger',
                    name: 'blobTriggerb6f7d01f70',
                    direction: 'in',
                    properties: {
                        supportsDeferredBinding: 'true',
                    },
                },
                $return: { type: 'http', name: 'httpOutput9a706511b1', direction: 'out' },
            },
            retryOptions: undefined,
        });
    });

    it('should set supportsDeferredBinding to false for blob trigger when deferredBinding is false', () => {
        const result = toCoreFunctionMetadata('blobFunction', {
            handler,
            trigger: {
                ...trigger.storageBlob({
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    deferredBinding: false,
                }),
            },
            return: output.http({}),
        });

        expect(result).to.deep.include({
            name: 'blobFunction',
            bindings: {
                blobTriggerac6f6ca39f: {
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    deferredBinding: false,
                    type: 'blobTrigger',
                    name: 'blobTriggerac6f6ca39f',
                    direction: 'in',
                    properties: {
                        supportsDeferredBinding: 'false',
                    },
                },
                $return: { type: 'http', name: 'httpOutput9a706511b1', direction: 'out' },
            },
            retryOptions: undefined,
        });
    });

    it('should set supportsDeferredBinding to false for blob trigger when deferredBinding is undefined', () => {
        const result = toCoreFunctionMetadata('blobFunction', {
            handler,
            trigger: trigger.storageBlob({
                path: 'samples-workitems/{name}',
                connection: 'AzureWebJobsStorage',
            }),
            return: output.http({}),
        });

        expect(result).to.deep.equal({
            name: 'blobFunction',
            bindings: {
                blobTrigger44ba8238b9: {
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    type: 'blobTrigger',
                    name: 'blobTrigger44ba8238b9',
                    direction: 'in',
                    properties: {
                        supportsDeferredBinding: 'false',
                    },
                },
                $return: { type: 'http', name: 'httpOutput9a706511b1', direction: 'out' },
            },
            retryOptions: undefined,
        });
    });

    it('should handle deferred binding for extra inputs', () => {
        const result = toCoreFunctionMetadata('funcName', {
            handler,
            trigger: trigger.http({}),
            extraInputs: [
                {
                    ...trigger.storageBlob({
                        path: 'samples-workitems/{name}',
                        connection: 'AzureWebJobsStorage',
                        deferredBinding: true,
                    }),
                },
            ],
        });

        expect(result).to.deep.equal({
            name: 'funcName',
            bindings: {
                httpTrigger433d175fc9: {
                    authLevel: 'anonymous',
                    methods: ['GET', 'POST'],
                    type: 'httpTrigger',
                    name: 'httpTrigger433d175fc9',
                    direction: 'in',
                    properties: { supportsDeferredBinding: 'false' },
                },
                blobTriggerb6f7d01f70: {
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    deferredBinding: true,
                    type: 'blobTrigger',
                    name: 'blobTriggerb6f7d01f70',
                    direction: 'in',
                    properties: { supportsDeferredBinding: 'true' },
                },
            },
            retryOptions: undefined,
        });
    });
});

describe('toCoreFunctionMetadata error handling', () => {
    const handler = () => {};

    it('should throw error for duplicate binding names', () => {
        expect(() => {
            toCoreFunctionMetadata('funcName', {
                handler,
                trigger: trigger.http({}),
                extraInputs: [
                    {
                        type: 'httpTrigger', // This creates a duplicate with the trigger
                        name: 'httpTrigger433d175fc9', // Using same name that would be generated by trigger.http({})
                    },
                ],
            });
        }).to.throw(/duplicate bindings found/i);
    });

    it('should preserve trigger type for non-trigger inputs', () => {
        const result = toCoreFunctionMetadata('funcName', {
            handler,
            trigger: trigger.http({}),
            extraInputs: [
                {
                    type: 'blob',
                    name: 'blobInput',
                    path: 'path/to/blob',
                },
            ],
        });

        expect(result.bindings['blobInput']?.type).to.equal('blob');
    });
});
