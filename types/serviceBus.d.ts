// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type ServiceBusQueueHandler = (message: unknown, context: InvocationContext) => FunctionResult;

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
