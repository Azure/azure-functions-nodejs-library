// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { CosmosDBTrigger, CosmosDBTriggerOptions } from './cosmosDB';
import { EventGridTrigger, EventGridTriggerOptions } from './eventGrid';
import { EventHubTrigger, EventHubTriggerOptions } from './eventHub';
import { GenericTriggerOptions } from './generic';
import { HttpTrigger, HttpTriggerOptions } from './http';
import { FunctionTrigger } from './index';
import {
    ServiceBusQueueTrigger,
    ServiceBusQueueTriggerOptions,
    ServiceBusTopicTrigger,
    ServiceBusTopicTriggerOptions,
} from './serviceBus';
import { SqlTrigger, SqlTriggerOptions } from './sql';
import {
    StorageBlobTrigger,
    StorageBlobTriggerOptions,
    StorageQueueTrigger,
    StorageQueueTriggerOptions,
} from './storage';
import { TimerTrigger, TimerTriggerOptions } from './timer';
import { WarmupTrigger, WarmupTriggerOptions } from './warmup';

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-http-webhook-trigger?&pivots=programming-language-javascript)
 */
export function http(options: HttpTriggerOptions): HttpTrigger;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-timer?pivots=programming-language-javascript)
 */
export function timer(options: TimerTriggerOptions): TimerTrigger;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-storage-blob-trigger?pivots=programming-language-javascript)
 */
export function storageBlob(options: StorageBlobTriggerOptions): StorageBlobTrigger;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-storage-queue-trigger?pivots=programming-language-javascript)
 */
export function storageQueue(options: StorageQueueTriggerOptions): StorageQueueTrigger;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-service-bus-trigger?pivots=programming-language-javascript)
 */
export function serviceBusQueue(options: ServiceBusQueueTriggerOptions): ServiceBusQueueTrigger;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-service-bus-trigger?pivots=programming-language-javascript)
 */
export function serviceBusTopic(options: ServiceBusTopicTriggerOptions): ServiceBusTopicTrigger;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-event-hubs-trigger?pivots=programming-language-javascript)
 */
export function eventHub(options: EventHubTriggerOptions): EventHubTrigger;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-event-grid-trigger?pivots=programming-language-javascript)
 */
export function eventGrid(options: EventGridTriggerOptions): EventGridTrigger;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-cosmosdb-v2-trigger?pivots=programming-language-javascript)
 */
export function cosmosDB(options: CosmosDBTriggerOptions): CosmosDBTrigger;

/**
 * [Link to docs and examples](https://learn.microsoft.com/azure/azure-functions/functions-bindings-warmup?tabs=isolated-process&pivots=programming-language-javascript)
 */
export function warmup(options: WarmupTriggerOptions): WarmupTrigger;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-azure-sql-trigger?pivots=programming-language-javascript)
 */
export function sql(options: SqlTriggerOptions): SqlTrigger;

/**
 * A generic option that can be used for any trigger type
 * Use this method if your desired trigger type does not already have its own method
 */
export function generic(options: GenericTriggerOptions): FunctionTrigger;
