// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { BlobServiceClient, StoragePipelineOptions } from '@azure/storage-blob';
import { BlobServiceClientStrategy } from './blobServiceClientStrategy';

/**
 * Strategy for creating BlobServiceClient using connection string
 */
export class ConnectionStringStrategy implements BlobServiceClientStrategy {
    /**
     * @param connectionString - Azure Storage connection string
     */
    constructor(private connectionString: string) {}

    createBlobServiceClient(options?: StoragePipelineOptions): BlobServiceClient {
        return BlobServiceClient.fromConnectionString(this.connectionString, options);
    }
}
