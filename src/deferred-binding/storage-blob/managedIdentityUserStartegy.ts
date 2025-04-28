// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { ManagedIdentityCredential } from '@azure/identity';
import { BlobServiceClient, StoragePipelineOptions } from '@azure/storage-blob';
import { StorageBlobServiceClientStrategy } from './storageBlobServiceClientStrategy';

/**
 * Strategy for creating StorageBlobServiceClient using explicit credentials
 */
export class ManagedIdentityUserStrategy implements StorageBlobServiceClientStrategy {
    /**
     * @param accountUrl - URL to the storage account
     * @param clientId - The user clientId to use for authentication
     */
    constructor(private accountUrl: string, private clientId: string) {}

    createStorageBlobServiceClient(options?: StoragePipelineOptions): BlobServiceClient {
        const credential = new ManagedIdentityCredential(this.clientId);
        return new BlobServiceClient(this.accountUrl, credential, options);
    }
}
