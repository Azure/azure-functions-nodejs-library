// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, StoragePipelineOptions } from '@azure/storage-blob';
import { StorageBlobServiceClientStrategy } from './storageBlobServiceClientStrategy';

export class ManagedIdentitySystemStrategy implements StorageBlobServiceClientStrategy {
    /**
     * @param accountUrl - URL to the storage account (e.g., https://myaccount.blob.core.windows.net)
     */
    constructor(private accountUrl: string) {}

    createStorageBlobServiceClient(options?: StoragePipelineOptions): BlobServiceClient {
        const credential = new DefaultAzureCredential();
        return new BlobServiceClient(this.accountUrl, credential, options);
    }
}
