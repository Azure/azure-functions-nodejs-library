// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { HttpOutput, HttpResponse } from './http';
import { FunctionInput, FunctionOutput } from './index';
import { StorageBlobInput, StorageBlobOutput, StorageQueueOutput } from './storage';

/**
 * Contains metadata and helper methods specific to this invocation
 */
export interface InvocationContext {
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
     * Trigger metadata
     */
    triggerMetadata: TriggerMetadata;

    /**
     * The retry context of the current function execution if the retry policy is defined
     */
    retryContext?: RetryContext;

    /**
     * TraceContext information to enable distributed tracing scenarios
     */
    traceContext?: TraceContext;
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
     * Get a secondary generic input for this invocation
     * @outputOrName the configuration object or name for this input
     */
    get(inputOrName: FunctionInput | string): unknown;

    /**
     * Set a secondary generic input for this invocation
     * @outputOrName the configuration object or name for this input
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
     * Set a secondary storage queue entry output for this invocation
     * @output the configuration object for this storage queue output
     * @queueItem the queue entry output value
     */
    set(output: StorageQueueOutput, queueItem: unknown): void;

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
export interface TriggerMetadata {
    [name: string]: any;
}

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
