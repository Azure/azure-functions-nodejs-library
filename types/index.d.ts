// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { HttpFunctionOptions, HttpHandler, HttpInput, HttpInputOptions, HttpOutput, HttpOutputOptions } from './http';
import { InvocationContext } from './InvocationContext';
import {
    StorageBlobFunctionOptions,
    StorageBlobInput,
    StorageBlobInputOptions,
    StorageBlobOutput,
    StorageBlobOutputOptions,
    StorageQueueFunctionOptions,
    StorageQueueInput,
    StorageQueueInputOptions,
    StorageQueueOutput,
    StorageQueueOutputOptions,
} from './storage';
import { TimerFunctionOptions, TimerInput, TimerInputOptions } from './timer';

export * from './http';
export * from './InvocationContext';
export * from './storage';
export * from './timer';

/**
 * The root namespace for performing operations on your Azure Function App
 */
export namespace app {
    /**
     * Registers an http function in your app that will be triggered by making a request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param options Configuration options describing the inputs, outputs, and handler for this function
     */
    export function http(name: string, options: HttpFunctionOptions): void;

    /**
     * Registers an http function in your app that will be triggered by making a 'GET' request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param handler The handler for this function
     */
    export function get(name: string, handler: HttpHandler): void;

    /**
     * Registers an http function in your app that will be triggered by making a 'GET' request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param options Configuration options describing the inputs, outputs, and handler for this function
     */
    export function get(name: string, options: HttpFunctionOptions): void;

    /**
     * Registers an http function in your app that will be triggered by making a 'PUT' request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param handler The handler for this function
     */
    export function put(name: string, handler: HttpHandler): void;

    /**
     * Registers an http function in your app that will be triggered by making a 'PUT' request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param options Configuration options describing the inputs, outputs, and handler for this function
     */
    export function put(name: string, options: HttpFunctionOptions): void;

    /**
     * Registers an http function in your app that will be triggered by making a 'POST' request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param handler The handler for this function
     */
    export function post(name: string, handler: HttpHandler): void;

    /**
     * Registers an http function in your app that will be triggered by making a 'POST' request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param options Configuration options describing the inputs, outputs, and handler for this function
     */
    export function post(name: string, options: HttpFunctionOptions): void;

    /**
     * Registers an http function in your app that will be triggered by making a 'PATCH' request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param handler The handler for this function
     */
    export function patch(name: string, handler: HttpHandler): void;

    /**
     * Registers an http function in your app that will be triggered by making a 'PATCH' request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param options Configuration options describing the inputs, outputs, and handler for this function
     */
    export function patch(name: string, options: HttpFunctionOptions): void;

    /**
     * Registers an http function in your app that will be triggered by making a 'DELETE' request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param handler The handler for this function
     */
    export function deleteRequest(name: string, handler: HttpHandler): void;

    /**
     * Registers an http function in your app that will be triggered by making a 'DELETE' request to the function url
     * @param name The name of the function. This will be the route unless a route is explicitly configured in the `HttpInputOptions`
     * @param options Configuration options describing the inputs, outputs, and handler for this function
     */
    export function deleteRequest(name: string, options: HttpFunctionOptions): void;

    /**
     * Registers a timer function in your app that will be triggered on a schedule
     * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
     * @param options Configuration options describing the inputs, outputs, and handler for this function
     */
    export function timer(name: string, options: TimerFunctionOptions): void;

    /**
     * Registers a blob function in your app that will be triggered whenever an item is added to a storage blob path
     * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
     * @param options Configuration options describing the inputs, outputs, and handler for this function
     */
    export function storageBlob(name: string, options: StorageBlobFunctionOptions): void;

    /**
     * Registers a queue function in your app that will be triggered whenever an item is added to a storage queue
     * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
     * @param options Configuration options describing the inputs, outputs, and handler for this function
     */
    export function storageQueue(name: string, options: StorageQueueFunctionOptions): void;

    /**
     * Registers a generic function in your app that will be triggered based on the `triggerType`
     * @param name The name of the function. The name must be unique within your app and will mostly be used for your own tracking purposes
     * @param options Configuration options describing the inputs, outputs, and handler for this function
     */
    export function generic(triggerType: string, name: string, options: FunctionOptions): void;
}

/**
 * The root namespace used to help create input configuration
 */
export namespace input {
    export function http(options: HttpInputOptions): HttpInput;
    export function timer(options: TimerInputOptions): TimerInput;
    export function storageBlob(options: StorageBlobInputOptions): StorageBlobInput;
    export function storageQueue(options: StorageQueueInputOptions): StorageQueueInput;
    export function generic(options: { type: string }): FunctionInput;
}

/**
 * The root namespace used to help create output configuration
 */
export namespace output {
    export function http(options: HttpOutputOptions): HttpOutput;
    export function storageBlob(options: StorageBlobOutputOptions): StorageBlobOutput;
    export function storageQueue(options: StorageQueueOutputOptions): StorageQueueOutput;
    export function generic(options: { type: string }): FunctionOutput;
}

/**
 * Void if no `return` output is registered
 * Otherwise, the registered `return` output
 */
export type FunctionResult<T = unknown> = T | Promise<T>;

export type FunctionHandler = (context: InvocationContext, triggerInput: any) => FunctionResult<any>;

/**
 * Configures the inputs, outputs, and handler for an Azure Function
 */
export interface FunctionOptions {
    /**
     * The code that will be executed when your function is triggered
     */
    handler: FunctionHandler;

    /**
     * Configuration for the primary input to the function, aka the reason it will be triggered
     * This is the only input that is passed as an argument to the function handler during invocation
     */
    trigger: FunctionInput;

    /**
     * Configuration for the optional primary output of the function
     * This is the main output that you should set as the return value of the function handler during invocation
     */
    return?: FunctionOutput;

    /**
     * Configuration for an optional set of secondary inputs
     * During invocation, get these values with `context.extraInputs.get()`
     */
    extraInputs?: FunctionInput[];

    /**
     * Configuration for an optional set of secondary outputs
     * During invocation, set these values with `context.extraOutputs.set()`
     */
    extraOutputs?: FunctionOutput[];
}

export interface FunctionOutput {
    type: string;
    name: string;
}

export interface FunctionInput {
    type: string;
    name: string;
}
