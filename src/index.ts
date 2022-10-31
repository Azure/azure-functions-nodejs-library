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
    EventGridFunctionOptions,
    EventGridOutput,
    EventGridOutputOptions,
    EventGridTrigger,
    EventGridTriggerOptions,
    EventHubFunctionOptions,
    EventHubOutput,
    EventHubOutputOptions,
    EventHubTrigger,
    EventHubTriggerOptions,
    FunctionInput,
    FunctionOptions,
    FunctionOutput,
    FunctionTrigger,
    GenericInputOptions,
    GenericOutputOptions,
    GenericTriggerOptions,
    HttpFunctionOptions,
    HttpHandler,
    HttpMethod,
    HttpMethodFunctionOptions,
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
import { CoreInvocationContext, FunctionCallback } from '@azure/functions-core';
import { returnBindingKey, version } from './constants';
import { InvocationModel } from './InvocationModel';
import { isTrigger } from './utils/isTrigger';

export { HttpRequest } from './http/HttpRequest';
export { InvocationContext } from './InvocationContext';

let coreApi: typeof coreTypes | undefined | null;
function tryGetCoreApiLazy(): typeof coreTypes | null {
    if (coreApi === undefined) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            coreApi = <typeof coreTypes>require('@azure/functions-core');
        } catch {
            coreApi = null;
        }
    }
    return coreApi;
}

class ProgrammingModel implements coreTypes.ProgrammingModel {
    name = '@azure/functions';
    version = version;
    getInvocationModel(coreCtx: CoreInvocationContext): InvocationModel {
        return new InvocationModel(coreCtx);
    }
}

let hasSetup = false;
function setup() {
    const coreApi = tryGetCoreApiLazy();
    if (!coreApi) {
        console.warn(
            'WARNING: Failed to detect the Azure Functions runtime. Switching "@azure/functions" package to test mode - not all features are supported.'
        );
    } else {
        coreApi.setProgrammingModel(new ProgrammingModel());
    }
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
    export function get(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'GET'));
    }

    export function put(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'PUT'));
    }

    export function post(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'POST'));
    }

    export function patch(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'PATCH'));
    }

    export function deleteRequest(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): void {
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

    export function eventHub(name: string, options: EventHubFunctionOptions): void {
        generic(name, {
            trigger: trigger.eventHub({
                connection: options.connection,
                eventHubName: options.eventHubName,
                cardinality: options.cardinality,
                consumerGroup: options.consumerGroup,
            }),
            ...options,
        });
    }

    export function eventGrid(name: string, options: EventGridFunctionOptions): void {
        generic(name, {
            trigger: trigger.eventGrid({}),
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

        const bindings: Record<string, coreTypes.RpcBindingInfo> = {};

        const trigger = options.trigger;
        bindings[trigger.name] = {
            ...trigger,
            direction: 'in',
            type: isTrigger(trigger.type) ? trigger.type : trigger.type + 'Trigger',
        };

        if (options.extraInputs) {
            for (const input of options.extraInputs) {
                bindings[input.name] = {
                    ...input,
                    direction: 'in',
                };
            }
        }

        if (options.return) {
            options.return.name = returnBindingKey;
            bindings[options.return.name] = {
                ...options.return,
                direction: 'out',
            };
        }

        if (options.extraOutputs) {
            for (const output of options.extraOutputs) {
                bindings[output.name] = {
                    ...output,
                    direction: 'out',
                };
            }
        }

        const coreApi = tryGetCoreApiLazy();
        if (!coreApi) {
            console.warn(
                `WARNING: Skipping call to register function "${name}" because the "@azure/functions" package is in test mode.`
            );
        } else {
            coreApi.registerFunction({ name, bindings }, <FunctionCallback>options.handler);
        }
    }
}

export namespace trigger {
    export function http(options: HttpTriggerOptions): HttpTrigger {
        return addTriggerBindingName({
            ...options,
            authLevel: options.authLevel || 'anonymous',
            methods: options.methods || ['GET', 'POST'],
            type: 'httpTrigger',
        });
    }

    export function timer(options: TimerTriggerOptions): TimerTrigger {
        return addTriggerBindingName({
            ...options,
            type: 'timerTrigger',
        });
    }

    export function storageBlob(options: StorageBlobTriggerOptions): StorageBlobTrigger {
        return addTriggerBindingName({
            ...options,
            type: 'blobTrigger',
        });
    }

    export function storageQueue(options: StorageQueueTriggerOptions): StorageQueueTrigger {
        return addTriggerBindingName({
            ...options,
            type: 'queueTrigger',
        });
    }

    export function serviceBusQueue(options: ServiceBusQueueTriggerOptions): ServiceBusQueueTrigger {
        return addTriggerBindingName({
            ...options,
            type: 'serviceBusTrigger',
        });
    }

    export function serviceBusTopic(options: ServiceBusTopicTriggerOptions): ServiceBusTopicTrigger {
        return addTriggerBindingName({
            ...options,
            type: 'serviceBusTrigger',
        });
    }

    export function eventHub(options: EventHubTriggerOptions): EventHubTrigger {
        return addTriggerBindingName({
            ...options,
            type: 'eventHubTrigger',
        });
    }

    export function eventGrid(options: EventGridTriggerOptions): EventGridTrigger {
        return addTriggerBindingName({
            ...options,
            type: 'eventGridTrigger',
        });
    }

    export function cosmosDB(options: CosmosDBTriggerOptions): CosmosDBTrigger {
        return addTriggerBindingName({
            ...options,
            type: 'cosmosDBTrigger',
        });
    }

    export function generic(options: GenericTriggerOptions): FunctionTrigger {
        return addTriggerBindingName(options);
    }
}

export namespace input {
    export function storageBlob(options: StorageBlobInputOptions): StorageBlobInput {
        return addInputBindingName({
            ...options,
            type: 'blob',
        });
    }

    export function cosmosDB(options: CosmosDBInputOptions): CosmosDBInput {
        return addInputBindingName({
            ...options,
            type: 'cosmosDB',
        });
    }

    export function generic(options: GenericInputOptions): FunctionInput {
        return addInputBindingName(options);
    }
}

export namespace output {
    export function http(options: HttpOutputOptions): HttpOutput {
        return addOutputBindingName({
            ...options,
            type: 'http',
        });
    }

    export function storageBlob(options: StorageBlobOutputOptions): StorageBlobOutput {
        return addOutputBindingName({
            ...options,
            type: 'blob',
        });
    }

    export function storageQueue(options: StorageQueueOutputOptions): StorageQueueOutput {
        return addOutputBindingName({
            ...options,
            type: 'queue',
        });
    }

    export function serviceBusQueue(options: ServiceBusQueueOutputOptions): ServiceBusQueueOutput {
        return addOutputBindingName({
            ...options,
            type: 'serviceBus',
        });
    }

    export function serviceBusTopic(options: ServiceBusTopicOutputOptions): ServiceBusTopicOutput {
        return addOutputBindingName({
            ...options,
            type: 'serviceBus',
        });
    }

    export function eventHub(options: EventHubOutputOptions): EventHubOutput {
        return addOutputBindingName({
            ...options,
            type: 'eventHub',
        });
    }

    export function eventGrid(options: EventGridOutputOptions): EventGridOutput {
        return addOutputBindingName({
            ...options,
            type: 'eventGrid',
        });
    }

    export function cosmosDB(options: CosmosDBOutputOptions): CosmosDBOutput {
        return addOutputBindingName({
            ...options,
            type: 'cosmosDB',
        });
    }

    export function generic(options: GenericOutputOptions): FunctionOutput {
        return addOutputBindingName(options);
    }
}

function addInputBindingName<T extends { type: string; name?: string }>(binding: T): T & { name: string } {
    return addBindingName(binding, 'Input');
}

function addTriggerBindingName<T extends { type: string; name?: string }>(binding: T): T & { name: string } {
    return addBindingName(binding, 'Trigger');
}

function addOutputBindingName<T extends { type: string; name?: string }>(binding: T): T & { name: string } {
    return addBindingName(binding, 'Output');
}

const bindingCounts: Record<string, number> = {};
/**
 * If the host spawns multiple workers, it expects the metadata (including binding name) to be the same accross workers
 * That means we need to generate binding names in a deterministic fashion, so we'll do that using a count
 * There's a tiny risk users register bindings in a non-deterministic order (i.e. async race conditions), but it's okay considering the following:
 * 1. We will track the count individually for each binding type. This makes the names more readable and reduces the chances a race condition will matter
 * 2. Users can manually specify the name themselves (aka if they're doing weird async stuff) and we will respect that
 * More info here: https://github.com/Azure/azure-functions-nodejs-worker/issues/638
 */
function addBindingName<T extends { type: string; name?: string }>(binding: T, suffix: string): T & { name: string } {
    if (!binding.name) {
        let bindingType = binding.type;
        if (!bindingType.toLowerCase().endsWith(suffix.toLowerCase())) {
            bindingType += suffix;
        }
        let count = bindingCounts[bindingType] || 0;
        count += 1;
        bindingCounts[bindingType] = count;
        binding.name = bindingType + count.toString();
    }
    return <T & { name: string }>binding;
}
