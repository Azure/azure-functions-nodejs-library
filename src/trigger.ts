// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    CosmosDBTrigger,
    CosmosDBTriggerOptions,
    EventGridTrigger,
    EventGridTriggerOptions,
    EventHubTrigger,
    EventHubTriggerOptions,
    FunctionTrigger,
    GenericTriggerOptions,
    HttpTrigger,
    HttpTriggerOptions,
    ServiceBusQueueTrigger,
    ServiceBusQueueTriggerOptions,
    ServiceBusTopicTrigger,
    ServiceBusTopicTriggerOptions,
    StorageBlobTrigger,
    StorageBlobTriggerOptions,
    StorageQueueTrigger,
    StorageQueueTriggerOptions,
    TimerTrigger,
    TimerTriggerOptions,
    WarmupTrigger,
    WarmupTriggerOptions,
} from '@azure/functions';
import { addBindingName } from './addBindingName';

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

export function warmup(options: WarmupTriggerOptions): WarmupTrigger {
    return addTriggerBindingName({
        ...options,
        type: 'warmupTrigger',
    });
}

export function generic(options: GenericTriggerOptions): FunctionTrigger {
    return addTriggerBindingName(options);
}

function addTriggerBindingName<T extends { type: string; name?: string }>(binding: T): T & { name: string } {
    return addBindingName(binding, 'Trigger');
}
