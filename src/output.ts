// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    CosmosDBOutput,
    CosmosDBOutputOptions,
    EventGridOutput,
    EventGridOutputOptions,
    EventHubOutput,
    EventHubOutputOptions,
    FunctionOutput,
    GenericOutputOptions,
    HttpOutput,
    HttpOutputOptions,
    ServiceBusQueueOutput,
    ServiceBusQueueOutputOptions,
    ServiceBusTopicOutput,
    ServiceBusTopicOutputOptions,
    SqlOutput,
    SqlOutputOptions,
    StorageBlobOutput,
    StorageBlobOutputOptions,
    StorageQueueOutput,
    StorageQueueOutputOptions,
    TableOutput,
    TableOutputOptions,
} from '@azure/functions';
import { addBindingName } from './addBindingName';

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

export function table(options: TableOutputOptions): TableOutput {
    return addOutputBindingName({
        ...options,
        type: 'table',
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

export function sql(options: SqlOutputOptions): SqlOutput {
    return addOutputBindingName({
        ...options,
        type: 'sql',
    });
}

export function generic(options: GenericOutputOptions): FunctionOutput {
    return addOutputBindingName(options);
}

function addOutputBindingName<T extends { type: string; name?: string }>(binding: T): T & { name: string } {
    return addBindingName(binding, 'Output');
}
