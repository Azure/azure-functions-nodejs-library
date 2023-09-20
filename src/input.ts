// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    CosmosDBInput,
    CosmosDBInputOptions,
    FunctionInput,
    GenericInputOptions,
    SqlInput,
    SqlInputOptions,
    StorageBlobInput,
    StorageBlobInputOptions,
} from '@azure/functions';
import { addBindingName } from './addBindingName';

export function storageBlob(options: StorageBlobInputOptions): StorageBlobInput {
    return addInputBindingName({
        ...options,
        type: 'blob',
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

export function generic(options: GenericInputOptions): FunctionInput {
    return addInputBindingName(options);
}

function addInputBindingName<T extends { type: string; name?: string }>(binding: T): T & { name: string } {
    return addBindingName(binding, 'Input');
}
