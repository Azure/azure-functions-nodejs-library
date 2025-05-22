// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionInput, FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type StorageBlobHandler = (blob: unknown, context: InvocationContext) => FunctionResult;
export type StorageQueueHandler = (queueEntry: unknown, context: InvocationContext) => FunctionResult;

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

export interface StorageBlobTriggerOptions extends StorageBlobOptions {
    /**
     * The source of the triggering event.
     * Use `EventGrid` for an Event Grid-based blob trigger, which provides much lower latency.
     * The default is `LogsAndContainerScan`, which uses the standard polling mechanism to detect changes in the container.
     */
    source?: 'EventGrid' | 'LogsAndContainerScan';
}
export type StorageBlobTrigger = FunctionTrigger & StorageBlobTriggerOptions;

export type StorageBlobInputOptions = StorageBlobOptions;
export type StorageBlobInput = FunctionInput & StorageBlobInputOptions;

export type StorageBlobOutputOptions = StorageBlobOptions;
export type StorageBlobOutput = FunctionOutput & StorageBlobOutputOptions;

export type StorageQueueTriggerOptions = StorageQueueOptions;
export type StorageQueueTrigger = FunctionTrigger & StorageQueueTriggerOptions;

export type StorageQueueOutputOptions = StorageQueueOptions;
export type StorageQueueOutput = FunctionOutput & StorageQueueOutputOptions;
