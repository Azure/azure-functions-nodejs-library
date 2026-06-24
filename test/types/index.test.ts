// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

// This file will be compiled by multiple versions of TypeScript as decribed in ./test/TypesTests.ts to verify there are no errors
interface TodoItem {
    id: string;
    status: string;
}

type CosmosDBv4LatestVersionFunctionOptions<T = unknown> =
    import('../../types').CosmosDBv4LatestVersionFunctionOptions<T>;
type CosmosDBv4AllVersionsAndDeletesFunctionOptions<T = unknown> =
    import('../../types').CosmosDBv4AllVersionsAndDeletesFunctionOptions<T>;
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
    changeFeedMode: 'AllVersionsAndDeletes',
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
void allVersionsAndDeletesOptions;
void validHandlerAssignableToAvad;
void invalidHandlerAssignableToAvad;
