// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { TokenCredential } from '@azure/identity';
import {
    AnonymousCredential,
    BlobServiceClient,
    StoragePipelineOptions,
    StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { BlobServiceClientStrategy } from './blobServiceClientStrategy';

/**
 * Strategy for creating BlobServiceClient using explicit credentials
 */
export class ExplicitCredentialStrategy implements BlobServiceClientStrategy {
    /**
     * @param accountUrl - URL to the storage account
     * @param credential - The credential to use for authentication
     */
    constructor(
        private accountUrl: string,
        private credential: StorageSharedKeyCredential | AnonymousCredential | TokenCredential
    ) {}

    createBlobServiceClient(options?: StoragePipelineOptions): BlobServiceClient {
        return new BlobServiceClient(this.accountUrl, this.credential, options);
    }
}
