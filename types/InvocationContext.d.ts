// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { HttpRequest } from './http';

/**
 * The context object can be used for writing logs, reading data from bindings, and setting outputs. A context object is passed
 * to your function from the Azure Functions runtime on function invocation.
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

    /**
     * Input and trigger binding data, as defined in function.json. Properties on this object are dynamically
     * generated and named based off of the "name" property in function.json.
     */
    bindings: ContextBindings;

    /**
     * HTTP request object. Provided to your function when using HTTP Bindings.
     */
    req?: HttpRequest;

    /**
     * HTTP response object. Provided to your function when using HTTP Bindings.
     */
    res?: {
        [key: string]: any;
    };
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
    attributes?: { [k: string]: string };
}

/**
 * Context bindings object. Provided to your function binding data, as defined in function.json.
 */
export interface ContextBindings {
    [name: string]: any;
}
