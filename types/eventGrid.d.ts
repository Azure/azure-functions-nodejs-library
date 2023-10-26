// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type EventGridHandler = (event: EventGridEvent, context: InvocationContext) => FunctionResult;

export interface EventGridFunctionOptions extends EventGridTriggerOptions, Partial<FunctionOptions> {
    handler: EventGridHandler;

    trigger?: EventGridTrigger;
}

/**
 * At this point in time there are no event grid trigger-specific options
 */
export interface EventGridTriggerOptions {}
export type EventGridTrigger = FunctionTrigger & EventGridTriggerOptions;

export interface EventGridOutputKeyOptions {
    /**
     * An app setting (or environment variable) that contains the URI for the custom topic
     */
    topicEndpointUri: string;

    /**
     * An app setting (or environment variable) that contains an access key for the custom topic
     */
    topicKeySetting: string;
}
export interface EventGridOutputConnectionOptions {
    /**
     * The value of the common prefix for the app setting that contains the `topicEndpointUri`.
     * When setting the `connection` property, the `topicEndpointUri` and `topicKeySetting` properties should NOT be set.
     */
    connection: string;
}
export type EventGridOutputOptions = EventGridOutputKeyOptions | EventGridOutputConnectionOptions;
export type EventGridOutput = FunctionOutput & EventGridOutputOptions;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/event-grid/event-schema)
 * This "partial" interface is meant to be used when creating an event yourself and allows some properties to be left out
 */
export interface EventGridPartialEvent {
    /**
     * Full resource path to the event source. This field isn't writeable. Event Grid provides this value
     * If included, must match the Event Grid topic Azure Resource Manager ID exactly. If not included, Event Grid will stamp onto the event.
     */
    topic?: string;

    /**
     * Publisher-defined path to the event subject
     */
    subject: string;

    /**
     * One of the registered event types for this event source
     */
    eventType: string;

    /**
     * The time the event is generated based on the provider's UTC time
     */
    eventTime: string;

    /**
     * Unique identifier for the event
     */
    id: string;

    /**
     * Event data specific to the resource provider
     */
    data?: Record<string, unknown>;

    /**
     * The schema version of the data object. The publisher defines the schema version.
     * If not included, will be stamped with an empty value
     */
    dataVersion?: string;

    /**
     * The schema version of the event metadata. Event Grid defines the schema of the top-level properties. Event Grid provides this value.
     * If included, must match the Event Grid Schema `metadataVersion` exactly (currently, only 1). If not included, Event Grid will stamp onto the event.
     */
    metadataVersion?: string;
}

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/event-grid/event-schema)
 */
export interface EventGridEvent extends EventGridPartialEvent {
    /**
     * Full resource path to the event source. This field isn't writeable. Event Grid provides this value
     */
    topic: string;

    /**
     * The schema version of the data object. The publisher defines the schema version.
     */
    dataVersion: string;

    /**
     * The schema version of the event metadata. Event Grid defines the schema of the top-level properties. Event Grid provides this value.
     */
    metadataVersion: string;
}
