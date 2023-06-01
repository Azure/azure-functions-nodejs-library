// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    CosmosDBFunctionOptions,
    CosmosDBTrigger,
    EventGridFunctionOptions,
    EventHubFunctionOptions,
    FunctionOptions,
    HttpFunctionOptions,
    HttpHandler,
    HttpMethod,
    HttpMethodFunctionOptions,
    ServiceBusQueueFunctionOptions,
    ServiceBusTopicFunctionOptions,
    StorageBlobFunctionOptions,
    StorageQueueFunctionOptions,
    TimerFunctionOptions,
} from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import { CoreInvocationContext, FunctionCallback } from '@azure/functions-core';
import { InvocationModel } from './InvocationModel';
import { returnBindingKey, version } from './constants';
import * as output from './output';
import * as trigger from './trigger';
import { isTrigger } from './utils/isTrigger';

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
    let cosmosTrigger: CosmosDBTrigger;
    if ('connectionStringSetting' in options) {
        cosmosTrigger = trigger.cosmosDB({
            checkpointDocumentCount: options.checkpointDocumentCount,
            checkpointInterval: options.checkpointInterval,
            collectionName: options.collectionName,
            connectionStringSetting: options.connectionStringSetting,
            createLeaseCollectionIfNotExists: options.createLeaseCollectionIfNotExists,
            databaseName: options.databaseName,
            feedPollDelay: options.feedPollDelay,
            id: options.id,
            leaseAcquireInterval: options.leaseAcquireInterval,
            leaseCollectionName: options.leaseCollectionName,
            leaseCollectionPrefix: options.leaseCollectionPrefix,
            leaseCollectionThroughput: options.leaseCollectionThroughput,
            leaseConnectionStringSetting: options.leaseConnectionStringSetting,
            leaseDatabaseName: options.leaseDatabaseName,
            leaseExpirationInterval: options.leaseExpirationInterval,
            leaseRenewInterval: options.leaseRenewInterval,
            maxItemsPerInvocation: options.maxItemsPerInvocation,
            partitionKey: options.partitionKey,
            preferredLocations: options.preferredLocations,
            sqlQuery: options.sqlQuery,
            startFromBeginning: options.startFromBeginning,
            useMultipleWriteLocations: options.useMultipleWriteLocations,
        });
    } else {
        cosmosTrigger = trigger.cosmosDB({
            connection: options.connection,
            containerName: options.containerName,
            createLeaseContainerIfNotExists: options.createLeaseContainerIfNotExists,
            databaseName: options.databaseName,
            feedPollDelay: options.feedPollDelay,
            id: options.id,
            leaseAcquireInterval: options.leaseAcquireInterval,
            leaseConnection: options.leaseConnection,
            leaseContainerName: options.leaseContainerName,
            leaseContainerPrefix: options.leaseContainerPrefix,
            leaseDatabaseName: options.leaseDatabaseName,
            leaseExpirationInterval: options.leaseExpirationInterval,
            leaseRenewInterval: options.leaseRenewInterval,
            leasesContainerThroughput: options.leasesContainerThroughput,
            maxItemsPerInvocation: options.maxItemsPerInvocation,
            partitionKey: options.partitionKey,
            preferredLocations: options.preferredLocations,
            sqlQuery: options.sqlQuery,
            startFromBeginning: options.startFromBeginning,
            startFromTime: options.startFromTime,
        });
    }
    generic(name, {
        trigger: cosmosTrigger,
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
