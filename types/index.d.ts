// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { InvocationContext } from './InvocationContext';

export * as app from './app';
export * from './cosmosDB';
export * from './eventGrid';
export * from './eventHub';
export * from './generic';
export * from './http';
export * as input from './input';
export * from './InvocationContext';
export * as output from './output';
export * from './serviceBus';
export * from './storage';
export * from './timer';
export * as trigger from './trigger';

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
