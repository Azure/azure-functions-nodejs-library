// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { BlobServiceClient, StoragePipelineOptions } from '@azure/storage-blob';

/**
 * Strategy interface for creating BlobServiceClient instances
 */
export interface BlobServiceClientStrategy {
    createBlobServiceClient(options?: StoragePipelineOptions): BlobServiceClient;
}
