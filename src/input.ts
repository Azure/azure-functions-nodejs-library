// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    CosmosDBInput,
    CosmosDBInputOptions,
    FunctionInput,
    GenericInputOptions,
    MySqlInput,
    MySqlInputOptions,
    SqlInput,
    SqlInputOptions,
    StorageBlobInput,
    StorageBlobInputOptions,
    TableInput,
    TableInputOptions,
    WebPubSubConnectionInput,
    WebPubSubConnectionInputOptions,
    WebPubSubContextInput,
    WebPubSubContextInputOptions,
} from '@azure/functions';
import { addBindingName } from './addBindingName';

export function storageBlob(options: StorageBlobInputOptions): StorageBlobInput {
    return addInputBindingName({
        ...options,
        type: 'blob',
    });
}

export function table(options: TableInputOptions): TableInput {
    return addInputBindingName({
        ...options,
        type: 'table',
    });
}

export function cosmosDB(options: CosmosDBInputOptions): CosmosDBInput {
    return addInputBindingName({
        ...options,
        type: 'cosmosDB',
    });
}

export function sql(options: SqlInputOptions): SqlInput {
    return addInputBindingName({
        ...options,
        type: 'sql',
    });
}

export function mySql(options: MySqlInputOptions): MySqlInput {
    return addInputBindingName({
        ...options,
        type: 'mysql',
    });
}

export function webPubSubConnection(options: WebPubSubConnectionInputOptions): WebPubSubConnectionInput {
    return addInputBindingName({
        ...options,
        type: 'webPubSubConnection',
    });
}

export function webPubSubContext(options: WebPubSubContextInputOptions): WebPubSubContextInput {
    return addInputBindingName({
        ...options,
        type: 'webPubSubContext',
    });
}

export function generic(options: GenericInputOptions): FunctionInput {
    return addInputBindingName(options);
}

function addInputBindingName<T extends { type: string; name?: string }>(binding: T): T & { name: string } {
    return addBindingName(binding, 'Input');
}
