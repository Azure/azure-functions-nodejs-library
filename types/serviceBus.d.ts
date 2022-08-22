// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type ServiceBusQueueHandler = (context: InvocationContext, message: unknown) => FunctionResult;

export interface ServiceBusQueueFunctionOptions extends ServiceBusQueueTriggerOptions, Partial<FunctionOptions> {
    handler: ServiceBusQueueHandler;

    trigger?: ServiceBusQueueTrigger;
}

/**
 * Full docs and examples:
 * https://docs.microsoft.com/azure/azure-functions/functions-bindings-service-bus-trigger?pivots=programming-language-javascript
 */
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

/**
 * Full docs and examples:
 * https://docs.microsoft.com/azure/azure-functions/functions-bindings-service-bus-output?pivots=programming-language-javascript
 */
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

export type ServiceBusTopicHandler = (context: InvocationContext, message: unknown) => FunctionResult;

export interface ServiceBusTopicFunctionOptions extends ServiceBusTopicTriggerOptions, Partial<FunctionOptions> {
    handler: ServiceBusTopicHandler;

    trigger?: ServiceBusTopicTrigger;
}

/**
 * Full docs and examples:
 * https://docs.microsoft.com/azure/azure-functions/functions-bindings-service-bus-trigger?pivots=programming-language-javascript
 */
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

/**
 * Full docs and examples:
 * https://docs.microsoft.com/azure/azure-functions/functions-bindings-service-bus-output?pivots=programming-language-javascript
 */
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
