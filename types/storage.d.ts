// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionInput, FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type StorageBlobHandler = (context: InvocationContext, blob: unknown) => FunctionResult;
export type StorageQueueHandler = (context: InvocationContext, queueEntry: unknown) => FunctionResult;

export interface StorageBlobFunctionOptions extends StorageBlobTriggerOptions, Partial<FunctionOptions> {
    handler: StorageBlobHandler;

    trigger?: StorageBlobTrigger;
}

export interface StorageQueueFunctionOptions extends StorageQueueTriggerOptions, Partial<FunctionOptions> {
    handler: StorageQueueHandler;

    trigger?: StorageQueueTrigger;
}

export interface StorageBlobOptions {
    /**
     * The path to the blob container, for example "samples-workitems/{name}"
     */
    path: string;

    /**
     * An app setting (or environment variable) with the storage connection string to be used by this blob input or output
     */
    connection: string;
}

export interface StorageQueueOptions {
    /**
     * The queue name
     */
    queueName: string;

    /**
     * An app setting (or environment variable) with the storage connection string to be used by this queue input or output
     */
    connection: string;
}

/**
 * Full docs and examples:
 * https://docs.microsoft.com/azure/azure-functions/functions-bindings-storage-blob-trigger?pivots=programming-language-javascript
 */
export type StorageBlobTriggerOptions = StorageBlobOptions;
export type StorageBlobTrigger = FunctionTrigger & StorageBlobTriggerOptions;

/**
 * Full docs and examples:
 * https://docs.microsoft.com/azure/azure-functions/functions-bindings-storage-blob-input?pivots=programming-language-javascript
 */
export type StorageBlobInputOptions = StorageBlobOptions;
export type StorageBlobInput = FunctionInput & StorageBlobInputOptions;

/**
 * Full docs and examples:
 * https://docs.microsoft.com/azure/azure-functions/functions-bindings-storage-blob-output?pivots=programming-language-javascript
 */
export type StorageBlobOutputOptions = StorageBlobOptions;
export type StorageBlobOutput = FunctionOutput & StorageBlobOutputOptions;

/**
 * Full docs and examples:
 * https://docs.microsoft.com/azure/azure-functions/functions-bindings-storage-queue-trigger?pivots=programming-language-javascript
 */
export type StorageQueueTriggerOptions = StorageQueueOptions;
export type StorageQueueTrigger = FunctionTrigger & StorageQueueTriggerOptions;

/**
 * Full docs and examples:
 * https://docs.microsoft.com/azure/azure-functions/functions-bindings-storage-queue-output?pivots=programming-language-javascript
 */
export type StorageQueueOutputOptions = StorageQueueOptions;
export type StorageQueueOutput = FunctionOutput & StorageQueueOutputOptions;
