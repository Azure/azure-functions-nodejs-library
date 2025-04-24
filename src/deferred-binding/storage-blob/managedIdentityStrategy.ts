// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, StoragePipelineOptions } from '@azure/storage-blob';
import { BlobServiceClientStrategy } from './blobServiceClientStrategy';

export class ManagedIdentityStrategy implements BlobServiceClientStrategy {
    /**
     * @param accountUrl - URL to the storage account (e.g., https://myaccount.blob.core.windows.net)
     */
    constructor(private accountUrl: string) {}

    createBlobServiceClient(options?: StoragePipelineOptions): BlobServiceClient {
        const credential = new DefaultAzureCredential();
        return new BlobServiceClient(this.accountUrl, credential, options);
    }
}
