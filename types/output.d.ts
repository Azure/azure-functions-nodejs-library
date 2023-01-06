// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { CosmosDBOutput, CosmosDBOutputOptions } from './cosmosDB';
import { EventGridOutput, EventGridOutputOptions } from './eventGrid';
import { EventHubOutput, EventHubOutputOptions } from './eventHub';
import { GenericOutputOptions } from './generic';
import { HttpOutput, HttpOutputOptions } from './http';
import { FunctionOutput } from './index';
import {
    ServiceBusQueueOutput,
    ServiceBusQueueOutputOptions,
    ServiceBusTopicOutput,
    ServiceBusTopicOutputOptions,
} from './serviceBus';
import { StorageBlobOutput, StorageBlobOutputOptions, StorageQueueOutput, StorageQueueOutputOptions } from './storage';

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-http-webhook-output?&pivots=programming-language-javascript)
 */
export function http(options: HttpOutputOptions): HttpOutput;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-storage-blob-output?pivots=programming-language-javascript)
 */
export function storageBlob(options: StorageBlobOutputOptions): StorageBlobOutput;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-storage-queue-output?pivots=programming-language-javascript)
 */
export function storageQueue(options: StorageQueueOutputOptions): StorageQueueOutput;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-service-bus-output?pivots=programming-language-javascript)
 */
export function serviceBusQueue(options: ServiceBusQueueOutputOptions): ServiceBusQueueOutput;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-service-bus-output?pivots=programming-language-javascript)
 */
export function serviceBusTopic(options: ServiceBusTopicOutputOptions): ServiceBusTopicOutput;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-event-hubs-output?pivots=programming-language-javascript)
 */
export function eventHub(options: EventHubOutputOptions): EventHubOutput;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-event-grid-output?pivots=programming-language-javascript)
 */
export function eventGrid(options: EventGridOutputOptions): EventGridOutput;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-cosmosdb-v2-output?pivots=programming-language-javascript)
 */
export function cosmosDB(options: CosmosDBOutputOptions): CosmosDBOutput;

/**
 * A generic option that can be used for any output type
 * Use this method if your desired output type does not already have its own method
 */
export function generic(options: GenericOutputOptions): FunctionOutput;
