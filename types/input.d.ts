// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { CosmosDBInput, CosmosDBInputOptions } from './cosmosDB';
import { GenericInputOptions } from './generic';
import { FunctionInput } from './index';
import { StorageBlobInput, StorageBlobInputOptions } from './storage';

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-storage-blob-input?pivots=programming-language-javascript)
 */
export function storageBlob(options: StorageBlobInputOptions): StorageBlobInput;

/**
 * [Link to docs and examples](https://docs.microsoft.com/azure/azure-functions/functions-bindings-cosmosdb-v2-input?pivots=programming-language-javascript)
 */
export function cosmosDB(options: CosmosDBInputOptions): CosmosDBInput;

/**
 * A generic option that can be used for any input type
 * Use this method if your desired input type does not already have its own method
 */
export function generic(options: GenericInputOptions): FunctionInput;
