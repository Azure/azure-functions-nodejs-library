// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { InvocationContext } from './InvocationContext';

export * as app from './app';
export * from './cosmosDB';
export * from './cosmosDB.v3';
export * from './cosmosDB.v4';
export * from './eventGrid';
export * from './eventHub';
export * from './generic';
export * from './hooks/appHooks';
export * from './hooks/HookContext';
export * from './hooks/invocationHooks';
export * from './hooks/logHooks';
export * from './http';
export * as input from './input';
export * from './InvocationContext';
export * from './mcpTool';
export * from './mySql';
export * as output from './output';
export * from './serviceBus';
export * from './setup';
export * from './sql';
export * from './storage';
export * from './table';
export * from './timer';
export * as trigger from './trigger';
export * from './warmup';
export * from './webpubsub';

// Export toolProp for fluent tool properties API
export { arg } from '../src/utils/toolProperties';

/**
 * Void if no `return` output is registered
 * Otherwise, the registered `return` output
 */
export type FunctionResult<T = unknown> = T | Promise<T>;

export type FunctionHandler = (triggerInput: any, context: InvocationContext) => FunctionResult<any>;

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
    trigger: FunctionTrigger;

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

/**
 * Full configuration for the primary input to a function
 */
export interface FunctionTrigger extends Record<string, unknown> {
    /**
     * The type for this trigger ('httpTrigger', 'timerTrigger', etc.)
     * If using the `trigger` namespace to create this object, the type will be set for you
     */
    type: string;

    /**
     * Must be unique within this function.
     * If using the `trigger` namespace to create this object, the name will be auto-generated for you
     */
    name: string;
}

/**
 * Full configuration for the secondary input to a function ("trigger" is the primary input)
 * NOTE: Not all triggers can be used as secondary inputs
 */
export interface FunctionInput extends Record<string, unknown> {
    /**
     * The type for this trigger ('blob', 'cosmosDB', etc.)
     * If using the `input` namespace to create this object, the type will be set for you
     */
    type: string;

    /**
     * Must be unique within this function.
     * If using the `input` namespace to create this object, the name will be auto-generated for you
     */
    name: string;
}

/**
 * Full configuration for the output to a function
 */
export interface FunctionOutput extends Record<string, unknown> {
    /**
     * The type for this output ('http', 'blob', 'queue', etc.)
     * If using the `output` namespace to create this object, the type will be set for you
     */
    type: string;

    /**
     * Must be unique within this function.
     * If using the `output` namespace to create this object, the name will be auto-generated for you
     */
    name: string;
}

export type RetryOptions = FixedDelayRetryOptions | ExponentialBackoffRetryOptions;

export interface FixedDelayRetryOptions {
    /**
     * A specified amount of time is allowed to elapse between each retry.
     */
    strategy: 'fixedDelay';

    /**
     * The maximum number of retries allowed per function execution. -1 means to retry indefinitely.
     */
    maxRetryCount: number;

    /**
     * The delay that's used between retries.
     * This can be a number in milliseconds or a Duration object
     */
    delayInterval: Duration | number;
}

export interface ExponentialBackoffRetryOptions {
    /**
     * The first retry waits for the minimum delay. On subsequent retries, time is added exponentially to
     * the initial duration for each retry, until the maximum delay is reached. Exponential back-off adds
     * some small randomization to delays to stagger retries in high-throughput scenarios.
     */
    strategy: 'exponentialBackoff';

    /**
     * The maximum number of retries allowed per function execution. -1 means to retry indefinitely.
     */
    maxRetryCount: number;

    /**
     * The minimum retry delay.
     * This can be a number in milliseconds, or a Duration object
     */
    minimumInterval: Duration | number;

    /**
     * The maximum retry delay.
     * This can be a number in milliseconds, or a Duration object
     */
    maximumInterval: Duration | number;
}

export interface Duration {
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
}

/**
 * Represents a type which can release resources, such as event listening or a timer.
 */
export declare class Disposable {
    /**
     * Combine many disposable-likes into one. You can use this method when having objects with a dispose function which aren't instances of `Disposable`.
     *
     * @param disposableLikes Objects that have at least a `dispose`-function member. Note that asynchronous dispose-functions aren't awaited.
     * @return Returns a new disposable which, upon dispose, will dispose all provided disposables.
     */
    static from(...disposableLikes: { dispose: () => any }[]): Disposable;

    /**
     * Creates a new disposable that calls the provided function on dispose.
     * *Note* that an asynchronous function is not awaited.
     *
     * @param callOnDispose Function that disposes something.
     */
    constructor(callOnDispose: () => any);

    /**
     * Dispose this object.
     */
    dispose(): any;
}

export type LogLevel = 'trace' | 'debug' | 'information' | 'warning' | 'error' | 'critical' | 'none';
