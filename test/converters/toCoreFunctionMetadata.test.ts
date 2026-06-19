// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { output, trigger } from '../../src';
import { addSdkBindingsFlag, toCoreFunctionMetadata } from '../../src/converters/toCoreFunctionMetadata';
import * as workerLogModule from '../../src/utils/workerSystemLog';
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

    it('cosmosDB trigger preserves changeFeedMode', () => {
        const result = toCoreFunctionMetadata('funcName', {
            handler,
            trigger: trigger.cosmosDB({
                connection: 'CosmosConnection',
                databaseName: 'dbName',
                containerName: 'containerName',
                changeFeedMode: 'AllVersionsAndDeletes',
            }),
            return: output.http({}),
        });

        const cosmosBinding = Object.values(result.bindings).find((b) => b.type === 'cosmosDBTrigger');
        expect(cosmosBinding).to.include({
            connection: 'CosmosConnection',
            databaseName: 'dbName',
            containerName: 'containerName',
            changeFeedMode: 'AllVersionsAndDeletes',
        });
    });

    it('cosmosDB trigger preserves changeFeedMode LatestVersion', () => {
        const result = toCoreFunctionMetadata('funcName', {
            handler,
            trigger: trigger.cosmosDB({
                connection: 'CosmosConnection',
                databaseName: 'dbName',
                containerName: 'containerName',
                changeFeedMode: 'LatestVersion',
            }),
            return: output.http({}),
        });

        const cosmosBinding = Object.values(result.bindings).find((b) => b.type === 'cosmosDBTrigger');
        expect(cosmosBinding).to.include({
            connection: 'CosmosConnection',
            databaseName: 'dbName',
            containerName: 'containerName',
            changeFeedMode: 'LatestVersion',
        });
    });
});

describe('toCoreFunctionMetadata sdk binding tests', () => {
    const handler = () => {}; // Mock handler function

    it('should set supportsDeferredBinding to true for blob trigger when sdkBinding is true', () => {
        const result = toCoreFunctionMetadata('blobFunction', {
            handler,
            trigger: {
                ...trigger.storageBlob({
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    sdkBinding: true,
                }),
            },
            return: output.http({}),
        });

        expect(result).to.deep.include({
            name: 'blobFunction',
            bindings: {
                blobTrigger97e7289e53: {
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    sdkBinding: true,
                    type: 'blobTrigger',
                    name: 'blobTrigger97e7289e53',
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

    it('should set supportsDeferredBinding to false for blob trigger when sdkBinding is false', () => {
        const result = toCoreFunctionMetadata('blobFunction', {
            handler,
            trigger: {
                ...trigger.storageBlob({
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    sdkBinding: false,
                }),
            },
            return: output.http({}),
        });

        expect(result).to.deep.include({
            name: 'blobFunction',
            bindings: {
                blobTrigger81b6e1578f: {
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    sdkBinding: false,
                    type: 'blobTrigger',
                    name: 'blobTrigger81b6e1578f',
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

    it('should set supportsDeferredBinding to false for blob trigger when sdkBinding is undefined', () => {
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

    it('should handle sdk binding for extra inputs', () => {
        const result = toCoreFunctionMetadata('funcName', {
            handler,
            trigger: trigger.http({}),
            extraInputs: [
                {
                    ...trigger.storageBlob({
                        path: 'samples-workitems/{name}',
                        connection: 'AzureWebJobsStorage',
                        sdkBinding: true,
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
                blobTrigger97e7289e53: {
                    path: 'samples-workitems/{name}',
                    connection: 'AzureWebJobsStorage',
                    sdkBinding: true,
                    type: 'blobTrigger',
                    name: 'blobTrigger97e7289e53',
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

describe('addSdkBindingsFlag - logging tests', () => {
    let workerSystemLogStub: sinon.SinonStub;

    beforeEach(() => {
        // Create a stub for workerSystemLog to capture calls and prevent actual logging
        workerSystemLogStub = sinon.stub(workerLogModule, 'workerSystemLog');
    });

    afterEach(() => {
        // Restore the original function after each test
        sinon.restore();
    });

    describe('when sdkBindingType is true', () => {
        it('should return supportsDeferredBinding:true and log with complete parameters', () => {
            // Arrange
            const sdkBindingType = true;
            const functionName = 'testFunction';
            const triggerType = 'http';
            const bindingName = 'req';
            const isBinding = false;

            // Act
            const result = addSdkBindingsFlag(sdkBindingType, functionName, triggerType, bindingName, isBinding);

            // Assert
            // 1. Verify return value
            expect(result).to.deep.equal({ supportsDeferredBinding: 'true' });

            // 2. Verify log was called
            expect(workerSystemLogStub.calledOnce).to.be.true;
            expect(workerSystemLogStub.firstCall.args[0]).to.equal('information');

            // 3. Verify log content
            const logArg = JSON.parse(workerSystemLogStub.firstCall.args[1]);
            expect(logArg).to.deep.include({
                operation: 'EnableDeferredBinding',
                properties: {
                    functionName: 'testFunction',
                    entityType: 'trigger',
                    triggerType: 'http',
                    bindingOrTriggerName: 'req',
                    supportsDeferredBinding: true,
                },
            });
            expect(logArg.message).to.equal("Enabled Deferred Binding of type 'http' for function 'testFunction'");
        });

        it('should handle binding types correctly', () => {
            // Arrange
            const sdkBindingType = true;
            const functionName = 'testFunction';
            const triggerType = 'blob';
            const bindingName = 'blobInput';
            const isBinding = true;

            // Act
            const result = addSdkBindingsFlag(sdkBindingType, functionName, triggerType, bindingName, isBinding);

            // Assert
            expect(result).to.deep.equal({ supportsDeferredBinding: 'true' });

            // Verify log contains binding instead of trigger
            const logArg = JSON.parse(workerSystemLogStub.firstCall.args[1]);
            expect(logArg.properties.entityType).to.equal('binding');
            expect(logArg.message).to.not.include('trigger');
        });

        it('should use default values for undefined parameters', () => {
            // Arrange
            const sdkBindingType = true;
            // All other parameters undefined

            // Act
            const result = addSdkBindingsFlag(sdkBindingType);

            // Assert
            expect(result).to.deep.equal({ supportsDeferredBinding: 'true' });

            // Verify log contains 'unknown' placeholders
            const logArg = JSON.parse(workerSystemLogStub.firstCall.args[1]);
            expect(logArg.properties.functionName).to.equal('unknown');
            expect(logArg.properties.triggerType).to.equal('unknown');
            expect(logArg.properties.bindingOrTriggerName).to.equal('unknown');
            expect(logArg.properties.entityType).to.equal('trigger'); // Default is trigger
            expect(logArg.message).to.equal("Enabled Deferred Binding of type 'unknown' for function 'unknown'");
        });

        it('should handle mixed undefined parameters correctly', () => {
            // Arrange
            const sdkBindingType = true;
            const functionName = 'testFunction';
            // Other parameters undefined

            // Act
            const result = addSdkBindingsFlag(sdkBindingType, functionName);

            // Assert
            expect(result).to.deep.equal({ supportsDeferredBinding: 'true' });

            // Verify log contains the provided function name but other 'unknown' placeholders
            const logArg = JSON.parse(workerSystemLogStub.firstCall.args[1]);
            expect(logArg.properties.functionName).to.equal('testFunction');
            expect(logArg.properties.triggerType).to.equal('unknown');
            expect(logArg.message).to.equal("Enabled Deferred Binding of type 'unknown' for function 'testFunction'");
        });
    });

    describe('when sdkBindingType is not true', () => {
        it('should return supportsDeferredBinding:false when sdkBindingType is false', () => {
            // Arrange
            const sdkBindingType = false;
            const functionName = 'testFunction';

            // Act
            const result = addSdkBindingsFlag(sdkBindingType, functionName);

            // Assert
            expect(result).to.deep.equal({ supportsDeferredBinding: 'false' });

            // Verify no logging occurred
            expect(workerSystemLogStub.called).to.be.false;
        });

        it('should return supportsDeferredBinding:false when sdkBindingType is undefined', () => {
            // Act
            const result = addSdkBindingsFlag();

            // Assert
            expect(result).to.deep.equal({ supportsDeferredBinding: 'false' });

            // Verify no logging occurred
            expect(workerSystemLogStub.called).to.be.false;
        });

        it('should return supportsDeferredBinding:false for any non-true sdkBindingType', () => {
            // Test with various non-true values
            const nonTrueValues = [null, 0, '', 'true', {}, [], NaN];

            // Test each value
            for (const testValue of nonTrueValues) {
                // Act
                const result = addSdkBindingsFlag(testValue);

                // Assert
                expect(result).to.deep.equal({ supportsDeferredBinding: 'false' });
                expect(workerSystemLogStub.called).to.be.false;

                // Reset the stub for the next iteration
                workerSystemLogStub.reset();
            }
        });
    });

    describe('log structure validation', () => {
        it('should produce correctly formatted JSON in logs', () => {
            // Arrange
            const sdkBindingType = true;
            const functionName = 'testFunction';
            const triggerType = 'http';
            const bindingName = 'req';
            const isBinding = false;

            // Act
            addSdkBindingsFlag(sdkBindingType, functionName, triggerType, bindingName, isBinding);

            // Assert
            expect(workerSystemLogStub.calledOnce).to.be.true;

            // Get the logged JSON string and parse it to verify it's valid JSON
            const logString = workerSystemLogStub.firstCall.args[1];

            // This should not throw if the JSON is valid
            const logObject = JSON.parse(logString);

            // Verify required fields
            expect(logObject).to.have.property('operation');
            expect(logObject).to.have.property('properties');
            expect(logObject).to.have.property('message');

            // Verify properties structure
            expect(logObject.properties).to.have.property('functionName');
            expect(logObject.properties).to.have.property('entityType');
            expect(logObject.properties).to.have.property('triggerType');
            expect(logObject.properties).to.have.property('bindingOrTriggerName');
            expect(logObject.properties).to.have.property('supportsDeferredBinding');

            // Verify data types
            expect(typeof logObject.operation).to.equal('string');
            expect(typeof logObject.message).to.equal('string');
            expect(typeof logObject.properties.supportsDeferredBinding).to.equal('boolean');
        });
    });
});
