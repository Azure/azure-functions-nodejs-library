// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    CosmosDBFunctionOptions,
    CosmosDBInput,
    CosmosDBInputOptions,
    CosmosDBOutput,
    CosmosDBOutputOptions,
    CosmosDBTrigger,
    CosmosDBTriggerOptions,
    FunctionInput,
    FunctionOptions,
    FunctionOutput,
    HttpFunctionOptions,
    HttpHandler,
    HttpMethod,
    HttpOutput,
    HttpOutputOptions,
    HttpTrigger,
    HttpTriggerOptions,
    ServiceBusQueueFunctionOptions,
    ServiceBusQueueOutput,
    ServiceBusQueueOutputOptions,
    ServiceBusQueueTrigger,
    ServiceBusQueueTriggerOptions,
    ServiceBusTopicFunctionOptions,
    ServiceBusTopicOutput,
    ServiceBusTopicOutputOptions,
    ServiceBusTopicTrigger,
    ServiceBusTopicTriggerOptions,
    StorageBlobFunctionOptions,
    StorageBlobInput,
    StorageBlobInputOptions,
    StorageBlobOutput,
    StorageBlobOutputOptions,
    StorageBlobTrigger,
    StorageBlobTriggerOptions,
    StorageQueueFunctionOptions,
    StorageQueueOutput,
    StorageQueueOutputOptions,
    StorageQueueTrigger,
    StorageQueueTriggerOptions,
    TimerFunctionOptions,
    TimerTrigger,
    TimerTriggerOptions,
} from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import {
    CoreInvocationContext,
    FunctionCallback,
    registerFunction,
    RpcBindingInfo,
    setProgrammingModel,
} from '@azure/functions-core';
import { returnBindingKey, version } from './constants';
import { InvocationModel } from './InvocationModel';
import { getRandomHexString } from './utils/getRandomHexString';

class ProgrammingModel implements coreTypes.ProgrammingModel {
    name = '@azure/functions';
    version = version;
    getInvocationModel(coreCtx: CoreInvocationContext): InvocationModel {
        return new InvocationModel(coreCtx);
    }
}

let hasSetup = false;
function setup() {
    setProgrammingModel(new ProgrammingModel());
    hasSetup = true;
}

function convertToHttpOptions(
    optionsOrHandler: HttpFunctionOptions | HttpHandler,
    method: HttpMethod
): HttpFunctionOptions {
    const options: HttpFunctionOptions =
        typeof optionsOrHandler === 'function' ? { handler: optionsOrHandler } : optionsOrHandler;
    options.methods = [method];
    return options;
}

export namespace app {
    export function get(name: string, optionsOrHandler: HttpFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'GET'));
    }

    export function put(name: string, optionsOrHandler: HttpFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'PUT'));
    }

    export function post(name: string, optionsOrHandler: HttpFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'POST'));
    }

    export function patch(name: string, optionsOrHandler: HttpFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'PATCH'));
    }

    export function deleteRequest(name: string, optionsOrHandler: HttpFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'DELETE'));
    }

    export function http(name: string, options: HttpFunctionOptions): void {
        options.return ||= output.http({});
        generic(name, {
            trigger: trigger.http({
                authLevel: options.authLevel,
                methods: options.methods,
                route: options.route,
            }),
            ...options,
        });
    }

    export function timer(name: string, options: TimerFunctionOptions): void {
        generic(name, {
            trigger: trigger.timer({
                schedule: options.schedule,
                runOnStartup: options.runOnStartup,
                useMonitor: options.useMonitor,
            }),
            ...options,
        });
    }

    export function storageBlob(name: string, options: StorageBlobFunctionOptions): void {
        generic(name, {
            trigger: trigger.storageBlob({
                connection: options.connection,
                path: options.path,
            }),
            ...options,
        });
    }

    export function storageQueue(name: string, options: StorageQueueFunctionOptions): void {
        generic(name, {
            trigger: trigger.storageQueue({
                connection: options.connection,
                queueName: options.queueName,
            }),
            ...options,
        });
    }

    export function serviceBusQueue(name: string, options: ServiceBusQueueFunctionOptions): void {
        generic(name, {
            trigger: trigger.serviceBusQueue({
                connection: options.connection,
                queueName: options.queueName,
                isSessionsEnabled: options.isSessionsEnabled,
            }),
            ...options,
        });
    }

    export function serviceBusTopic(name: string, options: ServiceBusTopicFunctionOptions): void {
        generic(name, {
            trigger: trigger.serviceBusTopic({
                connection: options.connection,
                topicName: options.topicName,
                subscriptionName: options.subscriptionName,
                isSessionsEnabled: options.isSessionsEnabled,
            }),
            ...options,
        });
    }

    export function cosmosDB(name: string, options: CosmosDBFunctionOptions): void {
        generic(name, {
            trigger: trigger.cosmosDB({
                collectionName: options.collectionName,
                connectionStringSetting: options.connectionStringSetting,
                createLeaseCollectionIfNotExists: options.createLeaseCollectionIfNotExists,
                databaseName: options.databaseName,
                id: options.id,
                leaseCollectionName: options.leaseCollectionName,
                leaseCollectionPrefix: options.leaseCollectionPrefix,
                leaseCollectionThroughput: options.leaseCollectionThroughput,
                leaseConnectionStringSetting: options.leaseConnectionStringSetting,
                leaseDatabaseName: options.leaseDatabaseName,
                partitionKey: options.partitionKey,
                sqlQuery: options.sqlQuery,
            }),
            ...options,
        });
    }

    export function generic(name: string, options: FunctionOptions): void {
        if (!hasSetup) {
            setup();
        }

        const bindings = {};

        const trigger = options.trigger;
        bindings[trigger.name] = {
            ...trigger,
            direction: RpcBindingInfo.Direction.in,
            type: /trigger$/i.test(trigger.type) ? trigger.type : trigger.type + 'Trigger',
        };

        if (options.extraInputs) {
            for (const input of options.extraInputs) {
                bindings[input.name] = {
                    ...input,
                    direction: RpcBindingInfo.Direction.in,
                };
            }
        }

        if (options.return) {
            options.return.name = returnBindingKey;
            bindings[options.return.name] = {
                ...options.return,
                direction: RpcBindingInfo.Direction.out,
            };
        }

        if (options.extraOutputs) {
            for (const output of options.extraOutputs) {
                bindings[output.name] = {
                    ...output,
                    direction: RpcBindingInfo.Direction.out,
                };
            }
        }

        registerFunction({ name, bindings }, <FunctionCallback>options.handler);
    }
}

export namespace trigger {
    export function http(options: HttpTriggerOptions): HttpTrigger {
        return {
            ...options,
            authLevel: options.authLevel || 'anonymous',
            methods: options.methods || ['GET', 'POST'],
            name: getNewTriggerName(),
            type: 'httpTrigger',
        };
    }

    export function timer(options: TimerTriggerOptions): TimerTrigger {
        return {
            ...options,
            name: getNewTriggerName(),
            type: 'timerTrigger',
        };
    }

    export function storageBlob(options: StorageBlobTriggerOptions): StorageBlobTrigger {
        return {
            ...options,
            name: getNewTriggerName(),
            type: 'blobTrigger',
        };
    }

    export function storageQueue(options: StorageQueueTriggerOptions): StorageQueueTrigger {
        return {
            ...options,
            name: getNewTriggerName(),
            type: 'queueTrigger',
        };
    }

    export function serviceBusQueue(options: ServiceBusQueueTriggerOptions): ServiceBusQueueTrigger {
        return {
            ...options,
            name: getNewTriggerName(),
            type: 'serviceBusTrigger',
        };
    }

    export function serviceBusTopic(options: ServiceBusTopicTriggerOptions): ServiceBusTopicTrigger {
        return {
            ...options,
            name: getNewTriggerName(),
            type: 'serviceBusTrigger',
        };
    }

    export function cosmosDB(options: CosmosDBTriggerOptions): CosmosDBTrigger {
        return {
            ...options,
            name: getNewTriggerName(),
            type: 'cosmosDBTrigger',
        };
    }

    export function generic(type: string, options: Record<string, unknown>): FunctionInput {
        return {
            ...options,
            name: getNewTriggerName(),
            type,
        };
    }
}

export namespace input {
    export function storageBlob(options: StorageBlobInputOptions): StorageBlobInput {
        return {
            ...options,
            name: getNewInputName(),
            type: 'blob',
        };
    }

    export function cosmosDB(options: CosmosDBInputOptions): CosmosDBInput {
        return {
            ...options,
            name: getNewInputName(),
            type: 'cosmosDB',
        };
    }

    export function generic(type: string, options: Record<string, unknown>): FunctionInput {
        return {
            ...options,
            name: getNewInputName(),
            type,
        };
    }
}

export namespace output {
    export function http(options: HttpOutputOptions): HttpOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type: 'http',
        };
    }

    export function storageBlob(options: StorageBlobOutputOptions): StorageBlobOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type: 'blob',
        };
    }

    export function storageQueue(options: StorageQueueOutputOptions): StorageQueueOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type: 'queue',
        };
    }

    export function serviceBusQueue(options: ServiceBusQueueOutputOptions): ServiceBusQueueOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type: 'serviceBus',
        };
    }

    export function serviceBusTopic(options: ServiceBusTopicOutputOptions): ServiceBusTopicOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type: 'serviceBus',
        };
    }

    export function cosmosDB(options: CosmosDBOutputOptions): CosmosDBOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type: 'cosmosDB',
        };
    }

    export function generic(type: string, options: Record<string, unknown>): FunctionOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type,
        };
    }
}

function getNewTriggerName(): string {
    // it has to start with a letter and can't have special characters like hyphens
    return 'trigger' + getRandomHexString(10);
}

function getNewInputName(): string {
    // it has to start with a letter and can't have special characters like hyphens
    return 'input' + getRandomHexString(10);
}

function getNewOutputName(): string {
    // it has to start with a letter and can't have special characters like hyphens
    return 'output' + getRandomHexString(10);
}
