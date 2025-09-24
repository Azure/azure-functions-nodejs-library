// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type ServiceBusQueueHandler = (messages: unknown | any, context: InvocationContext) => FunctionResult;

export interface ServiceBusQueueFunctionOptions extends ServiceBusQueueTriggerOptions, Partial<FunctionOptions> {
    handler: ServiceBusQueueHandler;

    trigger?: ServiceBusQueueTrigger;
}

export interface ServiceBusQueueTriggerOptions {
    /**
     * An app setting (or environment variable) with the service bus connection string
     */
    connection: string;

    /**
     * The name of the queue to monitor
     */
    queueName: string;

    /**
     * `true` if connecting to a [session-aware](https://docs.microsoft.com/azure/service-bus-messaging/message-sessions) queue. Default is `false`
     */
    isSessionsEnabled?: boolean;

    /**
     * Gets or sets a value indicating whether the trigger should automatically complete the message after successful processing.
     * If not explicitly set, the behavior will be based on the autoCompleteMessages configuration in host.json.
     * For more information, <see cref="https://aka.ms/AAp8dm9"/>"
     */
    autoCompleteMessages?: boolean;

    /**
     * Set to `many` in order to enable batching. If omitted or set to `one`, a single message is passed to the function.
     */
    cardinality?: 'many' | 'one';

    /**
     * Whether to use sdk binding for this blob operation.
     * */
    sdkBinding?: boolean;
}
export type ServiceBusQueueTrigger = FunctionTrigger & ServiceBusQueueTriggerOptions;

export interface ServiceBusQueueOutputOptions {
    /**
     * An app setting (or environment variable) with the service bus connection string
     */
    connection: string;

    /**
     * The name of the queue to monitor
     */
    queueName: string;
}
export type ServiceBusQueueOutput = FunctionOutput & ServiceBusQueueOutputOptions;

export type ServiceBusTopicHandler = (message: unknown, context: InvocationContext) => FunctionResult;

export interface ServiceBusTopicFunctionOptions extends ServiceBusTopicTriggerOptions, Partial<FunctionOptions> {
    handler: ServiceBusTopicHandler;

    trigger?: ServiceBusTopicTrigger;
}

export interface ServiceBusTopicTriggerOptions {
    /**
     * An app setting (or environment variable) with the service bus connection string
     */
    connection: string;

    /**
     * The name of the topic to monitor
     */
    topicName: string;

    /**
     * The name of the subscription to monitor
     */
    subscriptionName: string;

    /**
     * `true` if connecting to a [session-aware](https://docs.microsoft.com/azure/service-bus-messaging/message-sessions) subscription. Default is `false`
     */
    isSessionsEnabled?: boolean;

    /**
     * Set to `many` in order to enable batching. If omitted or set to `one`, a single message is passed to the function.
     */
    cardinality?: 'many' | 'one';
}
export type ServiceBusTopicTrigger = FunctionTrigger & ServiceBusTopicTriggerOptions;

export interface ServiceBusTopicOutputOptions {
    /**
     * An app setting (or environment variable) with the service bus connection string
     */
    connection: string;

    /**
     * The name of the topic to monitor
     */
    topicName: string;
}
export type ServiceBusTopicOutput = FunctionOutput & ServiceBusTopicOutputOptions;
