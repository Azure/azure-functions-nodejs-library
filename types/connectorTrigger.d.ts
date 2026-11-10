// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger, RetryOptions } from './index';
import { InvocationContext } from './InvocationContext';

/**
 * The connector event delivery mode.
 */
export enum DeliveryMode {
    Webhook = 'Webhook',
    Poll = 'Poll',
}

/**
 * The number of connector events passed to each function invocation.
 */
export enum Cardinality {
    One = 'one',
    Many = 'many',
}

export type ConnectorTriggerHandler<T = unknown> = (triggerInput: T, context: InvocationContext) => FunctionResult;

export interface ConnectorTriggerFunctionOptions<T = unknown>
    extends ConnectorTriggerOptions,
        Partial<FunctionOptions> {
    handler: ConnectorTriggerHandler<T>;

    trigger?: ConnectorTrigger;

    /**
     * An optional retry policy to rerun a failed execution until either successful completion occurs or the maximum number of retries is reached.
     * Learn more [here](https://learn.microsoft.com/azure/azure-functions/functions-bindings-error-pages)
     */
    retry?: RetryOptions;
}

export interface ConnectorTriggerOptions extends Record<string, unknown> {
    /**
     * The connector event delivery mode. Accepts enum members or the supported string values.
     * Defaults to `Webhook` when omitted.
     */
    deliveryMode?: DeliveryMode | 'Poll' | 'Webhook';

    /**
     * The connector connection setting. Required when `deliveryMode` is `Poll`.
     */
    connection?: string;

    /**
     * The connector trigger configuration name. Supports app setting expressions such as `%TriggerConfigName%`.
     * Required when `deliveryMode` is `Poll`.
     */
    triggerConfigName?: string;

    /**
     * Set to `many` to enable batching. Accepts enum members or the supported string values.
     * Defaults to `one`, which passes a single event to the function.
     * For batches, use an array as the handler's payload type, for example `app.connectorTrigger<MyEvent[]>`.
     */
    cardinality?: Cardinality | 'many' | 'one';

    /**
     * An optional per-function override for the maximum number of events per batch.
     * If omitted, Poll delivery uses the extension's app-wide host.json default.
     */
    maxBatchSize?: number;

    /**
     * An optional per-function override for the maximum number of concurrent single-event invocations.
     * If omitted, Poll delivery uses the extension's app-wide host.json default.
     * Batched invocations are processed one at a time by the extension.
     */
    maxConcurrentCalls?: number;

    /**
     * The target number of pending events per function instance used for scaling.
     */
    targetPendingEventThreshold?: number;
}

export type ConnectorTrigger = FunctionTrigger & ConnectorTriggerOptions;
