// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger, RetryOptions } from './index';
import { InvocationContext } from './InvocationContext';

export type EventHubHandler = (messages: unknown, context: InvocationContext) => FunctionResult;

export interface EventHubFunctionOptions extends EventHubTriggerOptions, Partial<FunctionOptions> {
    handler: EventHubHandler;

    trigger?: EventHubTrigger;

    /**
     * An optional retry policy to rerun a failed execution until either successful completion occurs or the maximum number of retries is reached.
     * Learn more [here](https://learn.microsoft.com/azure/azure-functions/functions-bindings-error-pages)
     */
    retry?: RetryOptions;
}

export interface EventHubTriggerOptions {
    /**
     * An app setting (or environment variable) with the event hub connection string
     */
    connection: string;

    /**
     * The name of the event hub. When the event hub name is also present in the connection string, that value overrides this property at runtime.
     */
    eventHubName: string;

    /**
     * Set to `many` in order to enable batching. If omitted or set to `one`, a single message is passed to the function.
     */
    cardinality?: 'many' | 'one';

    /**
     * An optional property that sets the [consumer group](https://docs.microsoft.com/azure/event-hubs/event-hubs-features#event-consumers) used to subscribe to events in the hub. If omitted, the `$Default` consumer group is used.
     */
    consumerGroup?: string;
}
export type EventHubTrigger = FunctionTrigger & EventHubTriggerOptions;

export interface EventHubOutputOptions {
    /**
     * An app setting (or environment variable) with the event hub connection string
     */
    connection: string;

    /**
     * The name of the event hub. When the event hub name is also present in the connection string, that value overrides this property at runtime.
     */
    eventHubName: string;
}
export type EventHubOutput = FunctionOutput & EventHubOutputOptions;
