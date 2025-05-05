// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { CosmosDBInput, CosmosDBOutput } from './cosmosDB';
import { EventGridOutput, EventGridPartialEvent } from './eventGrid';
import { EventHubOutput } from './eventHub';
import { HttpOutput, HttpResponse } from './http';
import { FunctionInput, FunctionOutput, FunctionTrigger, LogLevel } from './index';
import { MySqlInput, MySqlOutput } from './mySql';
import { ServiceBusQueueOutput, ServiceBusTopicOutput } from './serviceBus';
import { SqlInput, SqlOutput } from './sql';
import { StorageBlobInput, StorageBlobOutput, StorageQueueOutput } from './storage';
import { TableInput, TableOutput } from './table';
import { WebPubSubOutput } from './webpubsub';

/**
 * Contains metadata and helper methods specific to this invocation
 */
export declare class InvocationContext {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(init?: InvocationContextInit);

    /**
     * A unique guid specific to this invocation
     */
    invocationId: string;

    /**
     * The name of the function that is being invoked
     */
    functionName: string;

    /**
     * An object used to get secondary inputs
     */
    extraInputs: InvocationContextExtraInputs;

    /**
     * An object used to set secondary outputs
     */
    extraOutputs: InvocationContextExtraOutputs;

    /**
     * The recommended way to log data during invocation.
     * Similar to Node.js's `console.log`, but has integration with Azure features like application insights
     * Uses the 'information' log level
     */
    log(...args: any[]): void;

    /**
     * The recommended way to log trace data (level 0) during invocation.
     * Similar to Node.js's `console.trace`, but has integration with Azure features like application insights
     */
    trace(...args: any[]): void;

    /**
     * The recommended way to log debug data (level 1) during invocation.
     * Similar to Node.js's `console.debug`, but has integration with Azure features like application insights
     */
    debug(...args: any[]): void;

    /**
     * The recommended way to log information data (level 2) during invocation.
     * Similar to Node.js's `console.info`, but has integration with Azure features like application insights
     */
    info(...args: any[]): void;

    /**
     * The recommended way to log warning data (level 3) during invocation.
     * Similar to Node.js's `console.warn`, but has integration with Azure features like application insights
     */
    warn(...args: any[]): void;

    /**
     * The recommended way to log error data (level 4) during invocation.
     * Similar to Node.js's `console.error`, but has integration with Azure features like application insights
     */
    error(...args: any[]): void;

    /**
     * The retry context of the current function execution if the retry policy is defined
     */
    retryContext?: RetryContext;

    /**
     * TraceContext information to enable distributed tracing scenarios
     */
    traceContext?: TraceContext;

    /**
     * Metadata about the trigger or undefined if the metadata is already represented elsewhere
     * For example, this will be undefined for http and timer triggers because you can find that information on the request & timer object instead
     */
    triggerMetadata?: TriggerMetadata;

    /**
     * The options used when registering the function
     * NOTE: This value may differ slightly from the original because it has been validated and defaults may have been explicitly added
     */
    options: EffectiveFunctionOptions;
}

/**
 * An object used to get secondary inputs
 */
export interface InvocationContextExtraInputs {
    /**
     * Get a secondary storage blob entry input for this invocation
     * @input the configuration object for this storage blob input
     */
    get(input: StorageBlobInput): unknown;

    /**
     * Get a secondary table input for this invocation
     * @input the configuration object for this table input
     */
    get(input: TableInput): unknown;

    /**
     * Get a secondary Cosmos DB documents input for this invocation
     * @input the configuration object for this Cosmos DB input
     */
    get(input: CosmosDBInput): unknown;

    /**
     * Get a secondary SQL items input for this invocation
     * @input the configuration object for this SQL input
     */
    get(input: SqlInput): unknown;

    /**
     * Get a secondary MySql items input for this invocation
     * @input the configuration object for this MySql input
     */
    get(input: MySqlInput): unknown;

    /**
     * Get a secondary generic input for this invocation
     * @inputOrName the configuration object or name for this input
     */
    get(inputOrName: FunctionInput | string): unknown;

    /**
     * Set a secondary generic input for this invocation
     * @inputOrName the configuration object or name for this input
     * @value the input value
     */
    set(inputOrName: FunctionInput | string, value: unknown): void;
}

/**
 * An object used to set secondary outputs
 */
export interface InvocationContextExtraOutputs {
    /**
     * Set a secondary http response output for this invocation
     * @output the configuration object for this http output
     * @response the http response output value
     */
    set(output: HttpOutput, response: HttpResponse): void;

    /**
     * Set a secondary storage blob entry output for this invocation
     * @output the configuration object for this storage blob output
     * @blob the blob output value
     */
    set(output: StorageBlobOutput, blob: unknown): void;

    /**
     * Set a secondary table output for this invocation
     * @output the configuration object for this table output
     * @tableEntity the table output value
     */
    set(output: TableOutput, tableEntity: unknown): void;

    /**
     * Set a secondary storage queue entry output for this invocation
     * @output the configuration object for this storage queue output
     * @queueItem the queue entry output value
     */
    set(output: StorageQueueOutput, queueItem: unknown): void;

    /**
     * Set a secondary Cosmos DB documents output for this invocation
     * @output the configuration object for this Cosmos DB output
     * @documents the output document(s) value
     */
    set(output: CosmosDBOutput, documents: unknown): void;

    /**
     * Set a secondary SQL items output for this invocation
     * @output the configuration object for this SQL output
     * @documents the output item(s) value
     */
    set(output: SqlOutput, items: unknown): void;

    /**
     * Set a secondary Service Bus queue output for this invocation
     * @output the configuration object for this Service Bus output
     * @message the output message(s) value
     */
    set(output: ServiceBusQueueOutput, messages: unknown): void;

    /**
     * Set a secondary Service Bus topic output for this invocation
     * @output the configuration object for this Service Bus output
     * @message the output message(s) value
     */
    set(output: ServiceBusTopicOutput, messages: unknown): void;

    /**
     * Set a secondary Event Hub output for this invocation
     * @output the configuration object for this EventHub output
     * @message the output message(s) value
     */
    set(output: EventHubOutput, messages: unknown): void;

    /**
     * Set a secondary Event Grid output for this invocation
     * @output the configuration object for this Event Grid output
     * @message the output event(s) value
     */
    set(output: EventGridOutput, events: EventGridPartialEvent | EventGridPartialEvent[]): void;

    /**
     * Set a secondary MySql items output for this invocation
     * @output the configuration object for this MySql output
     * @documents the output item(s) value
     */
    set(output: MySqlOutput, items: unknown): void;

    /**
     * Set a secondary Web PubSub output for this invocation
     * @output the configuration object for this Web PubSub output
     * @message the output message(s) value
     */
    set(output: WebPubSubOutput, messages: unknown): void;

    /**
     * Set a secondary generic output for this invocation
     * @outputOrName the configuration object or name for this output
     * @value the output value
     */
    set(outputOrName: FunctionOutput | string, value: unknown): void;

    /**
     * Get a secondary generic output for this invocation
     * @outputOrName the configuration object or name for this output
     */
    get(outputOrName: FunctionOutput | string): unknown;
}

/**
 * Metadata related to the input that triggered your function
 */
export type TriggerMetadata = Record<string, unknown>;

export interface RetryContext {
    /**
     * Current retry count of the function executions.
     */
    retryCount: number;

    /**
     * Max retry count is the maximum number of times an execution is retried before eventual failure. A value of -1 means to retry indefinitely.
     */
    maxRetryCount: number;

    /**
     * Exception that caused the retry
     */
    exception?: Exception;
}

export interface Exception {
    source?: string;

    stackTrace?: string;

    message?: string;
}

/**
 * TraceContext information to enable distributed tracing scenarios
 */
export interface TraceContext {
    /**
     * Describes the position of the incoming request in its trace graph in a portable, fixed-length format
     */
    traceParent?: string | undefined;

    /**
     * Extends traceparent with vendor-specific data
     */
    traceState?: string | undefined;

    /**
     * Holds additional properties being sent as part of request telemetry
     */
    attributes?: Record<string, string>;
}

/**
 * The options used when registering the function, as passed to a specific invocation
 * NOTE: This value may differ slightly from the original because it has been validated and defaults may have been explicitly added
 */
export interface EffectiveFunctionOptions {
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
    extraInputs: FunctionInput[];

    /**
     * Configuration for an optional set of secondary outputs
     * During invocation, set these values with `context.extraOutputs.set()`
     */
    extraOutputs: FunctionOutput[];
}

/**
 * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
 */
export interface InvocationContextInit {
    /**
     * Defaults to 'unknown' if not specified
     */
    invocationId?: string;

    /**
     * Defaults to 'unknown' if not specified
     */
    functionName?: string;

    /**
     * Defaults to Node.js console if not specified
     */
    logHandler?: LogHandler;

    traceContext?: TraceContext;

    retryContext?: RetryContext;

    triggerMetadata?: TriggerMetadata;

    /**
     * Defaults to a trigger with 'unknown' type and name if not specified
     */
    options?: Partial<EffectiveFunctionOptions>;
}

export type LogHandler = (level: LogLevel, ...args: unknown[]) => void;
