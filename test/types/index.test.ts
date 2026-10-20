// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { CosmosDBv4ChangeFeedMode } from '../../types';
import type { SetupOptions } from '../../types';

// This file will be compiled by multiple versions of TypeScript as decribed in ./test/TypesTests.ts to verify there are no errors
interface TodoItem {
    id: string;
    status: string;
}

type CosmosDBv4LatestVersionFunctionOptions<T = unknown> =
    import('../../types').CosmosDBv4LatestVersionFunctionOptions<T>;
type CosmosDBv4AllVersionsAndDeletesFunctionOptions<T = unknown> =
    import('../../types').CosmosDBv4AllVersionsAndDeletesFunctionOptions<T>;
type CosmosDBv4FullFidelityFunctionOptions<T = unknown> =
    import('../../types').CosmosDBv4FullFidelityFunctionOptions<T>;
type CosmosDBChangeFeedItem<T = unknown> = import('../../types').CosmosDBChangeFeedItem<T>;

const latestVersionOptions: CosmosDBv4LatestVersionFunctionOptions<TodoItem> = {
    connection: 'CosmosConnection',
    databaseName: 'dbName',
    containerName: 'containerName',
    handler: (documents: TodoItem[]) => {
        const item: TodoItem | undefined = documents[0];
        void item?.id;
    },
};

const allVersionsAndDeletesOptions: CosmosDBv4AllVersionsAndDeletesFunctionOptions<TodoItem> = {
    connection: 'CosmosConnection',
    databaseName: 'dbName',
    containerName: 'containerName',
    changeFeedMode: 'AllVersionsAndDeletes' as CosmosDBv4ChangeFeedMode.AllVersionsAndDeletes,
    handler: (documents: CosmosDBChangeFeedItem<TodoItem>[]) => {
        const item: CosmosDBChangeFeedItem<TodoItem> | undefined = documents[0];
        const currentId: string | undefined = item?.current?.id;
        const previousId: string | undefined = item?.previous?.id;
        const operationType: string | undefined = item?.metadata?.operationType;
        void currentId;
        void previousId;
        void operationType;
    },
};

const deprecatedFullFidelityOptions: CosmosDBv4FullFidelityFunctionOptions<TodoItem> = allVersionsAndDeletesOptions;

type ServiceBusTopicFunctionOptions<T = unknown> = import('../../types').ServiceBusTopicFunctionOptions<T>;
type ServiceBusTopicTriggerOptions = import('../../types').ServiceBusTopicTriggerOptions;

const serviceBusTopicTriggerOptions: ServiceBusTopicTriggerOptions = {
    connection: 'ServiceBusConnection',
    topicName: 'topic',
    subscriptionName: 'subscription',
    sdkBinding: true,
};

const serviceBusTopicFunctionOptions: ServiceBusTopicFunctionOptions<string> = {
    ...serviceBusTopicTriggerOptions,
    handler: (message) => {
        const typedMessage: string = message;
        void typedMessage;
    },
};

const invalidServiceBusTopicTriggerOptions: ServiceBusTopicTriggerOptions = {
    connection: 'ServiceBusConnection',
    topicName: 'topic',
    subscriptionName: 'subscription',
    // @ts-expect-error sdkBinding only accepts boolean values
    sdkBinding: 'true',
};

declare const app: typeof import('../../types').app;
declare const trigger: typeof import('../../types').trigger;
function registerServiceBusTopic(): void {
    app.serviceBusTopic<string>('serviceBusTopic', serviceBusTopicFunctionOptions);
}

type ConnectorTriggerOptions = import('../../types').ConnectorTriggerOptions;
type ConnectorTriggerFunctionOptions<T = unknown> = import('../../types').ConnectorTriggerFunctionOptions<T>;

const connectorPollOptions: ConnectorTriggerFunctionOptions<TodoItem[]> = {
    deliveryMode: 'Poll',
    connection: 'ConnectorNamespace',
    triggerConfigName: '%TriggerConfigName%',
    cardinality: 'many',
    maxBatchSize: 10,
    maxConcurrentCalls: 2,
    targetPendingEventThreshold: 16,
    customField: 'custom',
    handler: (events) => {
        const event: TodoItem | undefined = events[0];
        void event?.id;
    },
};

const connectorWebhookOptions: ConnectorTriggerOptions = { deliveryMode: 'Webhook' };
const connectorDefaultOptions: ConnectorTriggerOptions = {};

function configureConnectorTriggerFromVariables(): void {
    const widenedOptions = { deliveryMode: 'Webhook' };
    // @ts-expect-error unannotated configuration variables widen deliveryMode to string
    trigger.connectorTrigger(widenedOptions);

    const typedOptions: ConnectorTriggerOptions = { deliveryMode: 'Webhook' };
    trigger.connectorTrigger(typedOptions);

    const literalOptions = { deliveryMode: 'Webhook' } as const;
    trigger.connectorTrigger(literalOptions);

    const widenedBatchOptions = { cardinality: 'many' };
    // @ts-expect-error unannotated configuration variables widen cardinality to string
    trigger.connectorTrigger(widenedBatchOptions);

    const typedBatchOptions: ConnectorTriggerOptions = { cardinality: 'many' };
    trigger.connectorTrigger(typedBatchOptions);

    const widenedFunctionOptions = { deliveryMode: 'Webhook', handler: () => {} };
    // @ts-expect-error function configuration variables also need literal deliveryMode types
    app.connectorTrigger('widenedConnector', widenedFunctionOptions);

    const typedFunctionOptions: ConnectorTriggerFunctionOptions = {
        deliveryMode: 'Webhook',
        handler: () => {},
    };
    app.connectorTrigger('typedConnector', typedFunctionOptions);
}

const invalidConnectorOptions: ConnectorTriggerOptions = {
    // @ts-expect-error deliveryMode only accepts Poll or Webhook
    deliveryMode: 'invalid',
    // @ts-expect-error connection must be a string
    connection: 123,
    // @ts-expect-error triggerConfigName must be a string
    triggerConfigName: 123,
    // @ts-expect-error cardinality only accepts one or many
    cardinality: 'invalid',
    // @ts-expect-error maxBatchSize must be a number
    maxBatchSize: '10',
    // @ts-expect-error maxConcurrentCalls must be a number
    maxConcurrentCalls: '2',
    // @ts-expect-error targetPendingEventThreshold must be a number
    targetPendingEventThreshold: '16',
};

function registerConnectorTrigger(): void {
    app.connectorTrigger<TodoItem[]>('pollConnector', connectorPollOptions);
    app.connectorTrigger('webhookConnector', { handler: () => {} });
}

type ExpectedAvadHandler = import('../../types').CosmosDBv4Handler<CosmosDBChangeFeedItem<TodoItem>>;
type ValidAvadHandler = (
    documents: CosmosDBChangeFeedItem<TodoItem>[],
    context: import('../../types').InvocationContext
) => import('../../types').FunctionResult;
type InvalidAvadHandler = (
    documents: TodoItem[],
    context: import('../../types').InvocationContext
) => import('../../types').FunctionResult;

type IsValidHandlerAssignableToAvad = ValidAvadHandler extends ExpectedAvadHandler ? true : false;
type IsInvalidHandlerAssignableToAvad = InvalidAvadHandler extends ExpectedAvadHandler ? true : false;

const validHandlerAssignableToAvad: IsValidHandlerAssignableToAvad = true;
const invalidHandlerAssignableToAvad: IsInvalidHandlerAssignableToAvad = false;

const setupOptions: SetupOptions = {
    enableHttpStream: false,
    capabilities: { a: 'b', c: false },
    enablePlainRpcStrings: false,
};
const emptySetupOptions: SetupOptions = {};

void latestVersionOptions;
void allVersionsAndDeletesOptions;
void deprecatedFullFidelityOptions;
void serviceBusTopicTriggerOptions;
void serviceBusTopicFunctionOptions;
void invalidServiceBusTopicTriggerOptions;
void registerServiceBusTopic;
void connectorPollOptions;
void connectorWebhookOptions;
void connectorDefaultOptions;
void configureConnectorTriggerFromVariables;
void invalidConnectorOptions;
void registerConnectorTrigger;
void validHandlerAssignableToAvad;
void invalidHandlerAssignableToAvad;
void setupOptions;
void emptySetupOptions;
