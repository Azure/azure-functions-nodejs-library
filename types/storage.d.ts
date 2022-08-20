// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionInput, FunctionOptions, FunctionOutput, FunctionResult } from './index';
import { InvocationContext } from './InvocationContext';

export type StorageBlobHandler = (context: InvocationContext, blob: unknown) => FunctionResult;
export type StorageQueueHandler = (context: InvocationContext, queueEntry: unknown) => FunctionResult;

export interface StorageBlobFunctionOptions extends StorageBlobInputOptions, Partial<FunctionOptions> {
    handler: StorageBlobHandler;
}

export interface StorageQueueFunctionOptions extends StorageQueueInputOptions, Partial<FunctionOptions> {
    handler: StorageQueueHandler;
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

export type StorageBlobInputOptions = StorageBlobOptions;
export type StorageBlobInput = FunctionInput & StorageBlobInputOptions;

export type StorageBlobOutputOptions = StorageQueueOptions;
export type StorageBlobOutput = FunctionOutput & StorageBlobOutputOptions;

export type StorageQueueInputOptions = StorageQueueOptions;
export type StorageQueueInput = FunctionInput & StorageQueueInputOptions;

export type StorageQueueOutputOptions = StorageQueueOptions;
export type StorageQueueOutput = FunctionOutput & StorageQueueOutputOptions;
