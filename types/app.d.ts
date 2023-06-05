// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { CosmosDBFunctionOptions } from './cosmosDB';
import { EventGridFunctionOptions } from './eventGrid';
import { EventHubFunctionOptions } from './eventHub';
import {
    AppStartHandler,
    AppTerminateHandler,
    Disposable,
    HookHandler,
    PostInvocationHandler,
    PostInvocationOptions,
    PreInvocationHandler,
    PreInvocationOptions,
} from './hooks';
import { HttpFunctionOptions, HttpHandler, HttpMethodFunctionOptions } from './http';
import { FunctionOptions, RegisterResult } from './index';
import { ServiceBusQueueFunctionOptions, ServiceBusTopicFunctionOptions } from './serviceBus';
import { StorageBlobFunctionOptions, StorageQueueFunctionOptions } from './storage';
import { TimerFunctionOptions } from './timer';

/**
 * Registers an http function in your app that will be triggered by making a request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function http(name: string, options: HttpFunctionOptions): RegisterResult;

/**
 * Registers an http function in your app that will be triggered by making a 'GET' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param handler The handler for this function
 */
export function get(name: string, handler: HttpHandler): RegisterResult;

/**
 * Registers an http function in your app that will be triggered by making a 'GET' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function get(name: string, options: HttpMethodFunctionOptions): RegisterResult;

/**
 * Registers an http function in your app that will be triggered by making a 'PUT' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param handler The handler for this function
 */
export function put(name: string, handler: HttpHandler): RegisterResult;

/**
 * Registers an http function in your app that will be triggered by making a 'PUT' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function put(name: string, options: HttpMethodFunctionOptions): RegisterResult;

/**
 * Registers an http function in your app that will be triggered by making a 'POST' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param handler The handler for this function
 */
export function post(name: string, handler: HttpHandler): RegisterResult;

/**
 * Registers an http function in your app that will be triggered by making a 'POST' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function post(name: string, options: HttpMethodFunctionOptions): RegisterResult;

/**
 * Registers an http function in your app that will be triggered by making a 'PATCH' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param handler The handler for this function
 */
export function patch(name: string, handler: HttpHandler): RegisterResult;

/**
 * Registers an http function in your app that will be triggered by making a 'PATCH' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function patch(name: string, options: HttpMethodFunctionOptions): RegisterResult;

/**
 * Registers an http function in your app that will be triggered by making a 'DELETE' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param handler The handler for this function
 */
export function deleteRequest(name: string, handler: HttpHandler): RegisterResult;

/**
 * Registers an http function in your app that will be triggered by making a 'DELETE' request to the function url
 * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpTriggerOptions`
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function deleteRequest(name: string, options: HttpMethodFunctionOptions): RegisterResult;

/**
 * Registers a timer function in your app that will be triggered on a schedule
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function timer(name: string, options: TimerFunctionOptions): RegisterResult;

/**
 * Registers a function in your app that will be triggered whenever an item is added to a storage blob path
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function storageBlob(name: string, options: StorageBlobFunctionOptions): RegisterResult;

/**
 * Registers a function in your app that will be triggered whenever an item is added to a storage queue
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function storageQueue(name: string, options: StorageQueueFunctionOptions): RegisterResult;

/**
 * Registers a function in your app that will be triggered whenever a message is added to a service bus queue
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function serviceBusQueue(name: string, options: ServiceBusQueueFunctionOptions): RegisterResult;

/**
 * Registers a function in your app that will be triggered whenever a message is added to a service bus topic
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function serviceBusTopic(name: string, options: ServiceBusTopicFunctionOptions): RegisterResult;

/**
 * Registers a function in your app that will be triggered whenever a message is added to an event hub
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function eventHub(name: string, options: EventHubFunctionOptions): RegisterResult;

/**
 * Registers a function in your app that will be triggered whenever an event is sent by an event grid source
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function eventGrid(name: string, options: EventGridFunctionOptions): RegisterResult;

/**
 * Registers a Cosmos DB function in your app that will be triggered whenever inserts and updates occur (not deletions)
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function cosmosDB(name: string, options: CosmosDBFunctionOptions): RegisterResult;

/**
 * Registers a generic function in your app that will be triggered based on the type specified in `options.trigger.type`
 * Use this method if your desired trigger type does not already have its own method
 * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
 * @param options Configuration options describing the inputs, outputs, and handler for this function
 */
export function generic(name: string, options: FunctionOptions): RegisterResult;

export function onTerminate(handler: AppTerminateHandler): Disposable;
export function onStart(handler: AppStartHandler): Disposable;

export function onPreInvocation(handler: PreInvocationHandler): Disposable;
export function onPreInvocation(options: PreInvocationOptions): Disposable;

export function onPostInvocation(handler: PostInvocationHandler): Disposable;
export function onPostInvocation(options: PostInvocationOptions): Disposable;

export function on(hookName: 'appStart', handler: AppStartHandler): Disposable;
export function on(hookName: 'appTerminate', handler: AppTerminateHandler): Disposable;
export function on(hookName: 'preInvocation', handler: PreInvocationHandler): Disposable;
export function on(hookName: 'postInvocation', handler: PostInvocationHandler): Disposable;
export function on(hookName: string, handler: HookHandler): Disposable;
