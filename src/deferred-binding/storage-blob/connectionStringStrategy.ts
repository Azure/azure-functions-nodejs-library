// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { BlobServiceClient, StoragePipelineOptions } from '@azure/storage-blob';
import { StorageBlobServiceClientStrategy } from './storageBlobServiceClientStrategy';

/**
 * Strategy for creating BlobServiceClient using connection string
 */
export class ConnectionStringStrategy implements StorageBlobServiceClientStrategy {
    /**
     * @param connectionString - Azure Storage connection string
     */
    constructor(private connectionString: string) {}

    createStorageBlobServiceClient(options?: StoragePipelineOptions): BlobServiceClient {
        return BlobServiceClient.fromConnectionString(this.connectionString, options);
    }
}
