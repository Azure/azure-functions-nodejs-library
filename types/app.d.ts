// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { CosmosDBFunctionOptions } from './cosmosDB';
import { EventGridEvent, EventGridFunctionOptions } from './eventGrid';
import { EventHubFunctionOptions } from './eventHub';
import { GenericFunctionOptions } from './generic';
import { HttpFunctionOptions, HttpHandler, HttpMethodFunctionOptions } from './http';
import { McpToolFunctionOptions } from './mcpTool';
import { MySqlFunctionOptions } from './mySql';
import { ServiceBusQueueFunctionOptions, ServiceBusTopicFunctionOptions } from './serviceBus';
import { SetupOptions } from './setup';
import { SqlFunctionOptions } from './sql';
import { StorageBlobFunctionOptions, StorageQueueFunctionOptions } from './storage';
import { TimerFunctionOptions } from './timer';
import { WarmupFunctionOptions } from './warmup';
import { WebPubSubFunctionOptions } from './webpubsub';

/**
 * Optional method to configure the behavior of your app.
 * This can only be done during app startup, before invocations occur.
 * If called multiple times, options will be merged with the previous options specified.
 */
export declare function setup(options: SetupOptions): void;

/**
 * Registers an http function in your app that will be triggered by making a request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function http(name: string, options: HttpFunctionOptions): void;

/**
 * Registers an http function in your app that will be triggered by making a 'GET' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param handler The handler for this function
 */
export function get(name: string, handler: HttpHandler): void;

/**
 * Registers an http function in your app that will be triggered by making a 'GET' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function get(name: string, options: HttpMethodFunctionOptions): void;

/**
 * Registers an http function in your app that will be triggered by making a 'PUT' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param handler The handler for this function
 */
export function put(name: string, handler: HttpHandler): void;

/**
 * Registers an http function in your app that will be triggered by making a 'PUT' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function put(name: string, options: HttpMethodFunctionOptions): void;

/**
 * Registers an http function in your app that will be triggered by making a 'POST' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param handler The handler for this function
 */
export function post(name: string, handler: HttpHandler): void;

/**
 * Registers an http function in your app that will be triggered by making a 'POST' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function post(name: string, options: HttpMethodFunctionOptions): void;

/**
 * Registers an http function in your app that will be triggered by making a 'PATCH' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param handler The handler for this function
 */
export function patch(name: string, handler: HttpHandler): void;

/**
 * Registers an http function in your app that will be triggered by making a 'PATCH' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function patch(name: string, options: HttpMethodFunctionOptions): void;

/**
 * Registers an http function in your app that will be triggered by making a 'DELETE' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param handler The handler for this function
 */
export function deleteRequest(name: string, handler: HttpHandler): void;

/**
 * Registers an http function in your app that will be triggered by making a 'DELETE' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function deleteRequest(name: string, options: HttpMethodFunctionOptions): void;

/**
 * Registers a timer function in your app that will be triggered on a schedule
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function timer(name: string, options: TimerFunctionOptions): void;

/**
 * Registers a function in your app that will be triggered whenever an item is added to a storage blob path
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function storageBlob<T = unknown>(name: string, options: StorageBlobFunctionOptions<T>): void;

/**
 * Registers a function in your app that will be triggered whenever an item is added to a storage queue
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function storageQueue<T = unknown>(name: string, options: StorageQueueFunctionOptions<T>): void;

/**
 * Registers a function in your app that will be triggered whenever a message is added to a service bus queue
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function serviceBusQueue<T = unknown>(name: string, options: ServiceBusQueueFunctionOptions<T>): void;

/**
 * Registers a function in your app that will be triggered whenever a message is added to a service bus topic
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function serviceBusTopic<T = unknown>(name: string, options: ServiceBusTopicFunctionOptions<T>): void;

/**
 * Registers a function in your app that will be triggered whenever a message is added to an event hub
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function eventHub<T = unknown>(name: string, options: EventHubFunctionOptions<T>): void;

/**
 * Registers a function in your app that will be triggered whenever an event is sent by an event grid source
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function eventGrid<T = EventGridEvent>(name: string, options: EventGridFunctionOptions<T>): void;

/**
 * Registers a Cosmos DB function in your app that will be triggered whenever inserts and updates occur (not deletions)
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function cosmosDB<T = unknown>(name: string, options: CosmosDBFunctionOptions<T>): void;

/**
 * Registers a function in your app that will be triggered when an instance is added to scale a running function app.
 * The warmup trigger is only called during scale-out operations, not during restarts or other non-scale startups.
 * Make sure your logic can load all required dependencies without relying on the warmup trigger.
 * Lazy loading is a good pattern to achieve this goal.
 * The warmup trigger isn't available to apps running on the Consumption plan.
 * For more information, please see the [Azure Functions warmup trigger documentation](https://learn.microsoft.com/azure/azure-functions/functions-bindings-warmup?tabs=isolated-process&pivots=programming-language-javascript).
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function warmup(name: string, options: WarmupFunctionOptions): void;

/**
 * Registers a SQL function in your app that will be triggered when a row is created, updated, or deleted
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function sql<T = unknown>(name: string, options: SqlFunctionOptions<T>): void;

/**
 * Registers a MySql function in your app that will be triggered when a row is created or updated
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function mySql<T = unknown>(name: string, options: MySqlFunctionOptions<T>): void;

/**
 * Registers a generic function in your app that will be triggered based on the type specified in `options.trigger.type`
 * Use this method if your desired trigger type does not already have its own method
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function generic(name: string, options: GenericFunctionOptions): void;

/**
 * Registers a WebPubSub function in your app that will be triggered by WebPubSub events
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function webPubSub<T = unknown>(name: string, options: WebPubSubFunctionOptions<T>): void;

/**
 * Registers an MCP Tool function in your app
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function mcpTool<T = unknown>(name: string, options: McpToolFunctionOptions<T>): void;

export * as hook from './hooks/registerHook';
