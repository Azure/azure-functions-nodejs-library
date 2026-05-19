// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionInput, FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type WebPubSubHandler<T = unknown> = (message: T, context: InvocationContext) => FunctionResult;

export interface WebPubSubFunctionOptions<T = unknown> extends WebPubSubTriggerOptions, Partial<FunctionOptions> {
    handler: WebPubSubHandler<T>;

    trigger?: WebPubSubTrigger;
}

export interface WebPubSubTriggerOptions {
    /**
     * Required - The variable name used in function code for the parameter that receives the event data
     */
    name: string;

    /**
     * Required - The name of the hub to which the function is bound
     */
    hub: string;

    /**
     * Required - The type of event to which the function should respond
     * Must be either 'user' or 'system'
     */
    eventType: 'user' | 'system';

    /**
     * Required - The name of the event to which the function should respond
     * For system event type: 'connect', 'connected', or 'disconnected'
     * For user-defined subprotocols: 'message'
     * For system supported subprotocol json.webpubsub.azure.v1: user-defined event name
     */
    eventName: string;

    /**
     * Optional - Specifies which client protocol can trigger the Web PubSub trigger functions
     * Default is 'all'
     */
    clientProtocols?: 'all' | 'webPubSub' | 'mqtt';

    /**
     * Optional - The names of app settings or setting collections that specify the upstream Azure Web PubSub services
     * Used for signature validation
     * Defaults to "WebPubSubConnectionString" if not specified
     */
    connections?: string[];

    /**
     * Optional - The name of the app setting that contains the Web PubSub Service connection string.
     * Defaults to "WebPubSubConnectionString" if not specified.
     * @deprecated Use `connections` instead.
     */
    connection?: string;
}

export type WebPubSubTrigger = FunctionTrigger & WebPubSubTriggerOptions;

export interface WebPubSubConnectionInputOptions {
    /**
     * Required - Variable name used in function code for input connection binding object.
     */
    name: string;

    /**
     * Required - The name of the Web PubSub hub for the function to be triggered.
     * Can be set in the attribute (higher priority) or in app settings as a global value.
     */
    hub: string;

    /**
     * Optional - The value of the user identifier claim to be set in the access key token.
     */
    userId?: string;

    /**
     * Optional - The client protocol type.
     * Valid values are 'default' and 'mqtt'.
     * For MQTT clients, you must set it to 'mqtt'.
     * For other clients, you can omit the property or set it to 'default'.
     */
    clientProtocol?: 'default' | 'mqtt';

    /**
     * Optional - The name of the app setting that contains the Web PubSub Service connection string.
     * Defaults to "WebPubSubConnectionString".
     */
    connection?: string;
}
export type WebPubSubConnectionInput = FunctionInput & WebPubSubConnectionInputOptions;

export interface WebPubSubContextInputOptions {
    /**
     * Required - Variable name used in function code for input Web PubSub request.
     */
    name: string;

    /**
     * Optional - The names of app settings or setting collections that specify the upstream Azure Web PubSub services.
     * The value is used for Abuse Protection and Signature validation.
     * The value is auto resolved with "WebPubSubConnectionString" by default.
     */
    connections?: string[];

    /**
     * Optional - The name of the app setting that contains the Web PubSub Service connection string.
     * Defaults to "WebPubSubConnectionString" if not specified.
     * @deprecated Use `connections` instead.
     */
    connection?: string;
}
export type WebPubSubContextInput = FunctionInput & WebPubSubContextInputOptions;

export interface WebPubSubOutputOptions {
    /**
     * Required - Variable name used in function code for output binding object.
     */
    name: string;

    /**
     * Required - The name of the hub to which the function is bound.
     * Can be set in the attribute (higher priority) or in app settings as a global value.
     */
    hub: string;

    /**
     * Optional - The name of the app setting that contains the Web PubSub Service connection string.
     * Defaults to "WebPubSubConnectionString".
     */
    connection?: string;
}
export type WebPubSubOutput = FunctionOutput & WebPubSubOutputOptions;
