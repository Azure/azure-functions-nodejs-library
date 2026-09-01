// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

// This file will be compiled by multiple versions of TypeScript as decribed in ./test/TypesTests.ts to verify there are no errors
interface TodoItem {
    id: string;
    status: string;
}

type CosmosDBv4LatestVersionFunctionOptions<T = unknown> =
    import('../../types').CosmosDBv4LatestVersionFunctionOptions<T>;
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

const fullFidelityOptions: CosmosDBv4FullFidelityFunctionOptions<TodoItem> = {
    connection: 'CosmosConnection',
    databaseName: 'dbName',
    containerName: 'containerName',
    changeFeedMode: 'FullFidelity',
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
function registerServiceBusTopic(): void {
    app.serviceBusTopic<string>('serviceBusTopic', serviceBusTopicFunctionOptions);
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

void latestVersionOptions;
void fullFidelityOptions;
void serviceBusTopicTriggerOptions;
void serviceBusTopicFunctionOptions;
void invalidServiceBusTopicTriggerOptions;
void registerServiceBusTopic;
void validHandlerAssignableToAvad;
void invalidHandlerAssignableToAvad;
