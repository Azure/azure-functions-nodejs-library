// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { BlobClient, ContainerClient, StoragePipelineOptions } from '@azure/storage-blob';
import { StorageBlobServiceClientStrategy } from './storageBlobServiceClientStrategy';

export class AzureStorageBlobClient {
    private blobClient: BlobClient | undefined;
    private containerClient: ContainerClient | undefined;

    /**
     * Creates a new AzureStorageBlobClient instance
     *
     * @param strategyOrAccountUrl - The strategy to use for creating the BlobServiceClient or the account URL
     * @param credentialOrOptions - The credential to use for authentication or storage pipeline options
     * @param options - Storage pipeline options (optional, only used when the first parameter is an account URL)
     */
    constructor(
        strategy: StorageBlobServiceClientStrategy,
        containerName?: string,
        blobName?: string,
        options?: StoragePipelineOptions
    ) {
        const storageBlobServiceClient = strategy.createStorageBlobServiceClient(options);
        // Initialize container and blob clients if names are provided
        if (containerName) {
            this.containerClient = storageBlobServiceClient.getContainerClient(containerName);

            if (blobName) {
                this.blobClient = this.containerClient.getBlobClient(blobName);
            }
        }
    }

    /**
     * Gets the BlobClient instance
     * @returns The BlobClient
     */
    getBlobClient(): BlobClient {
        if (!this.blobClient) {
            throw new Error('No blob client available. A blob name must be provided in the constructor.');
        }
        return this.blobClient;
    }

    /**
     * Gets the ContainerClient instance
     * @returns The ContainerClient
     */
    getContainerClient(): ContainerClient {
        if (!this.containerClient) {
            throw new Error('No container client available. A container name must be provided in the constructor.');
        }
        return this.containerClient;
    }
}
