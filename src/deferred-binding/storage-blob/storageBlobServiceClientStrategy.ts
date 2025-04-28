// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { BlobServiceClient, StoragePipelineOptions } from '@azure/storage-blob';

/**
 * Strategy interface for creating StorageBlobServiceClient instances
 */
export interface StorageBlobServiceClientStrategy {
    createStorageBlobServiceClient(options?: StoragePipelineOptions): BlobServiceClient;
}
