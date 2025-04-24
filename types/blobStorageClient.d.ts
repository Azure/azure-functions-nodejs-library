// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { BlobClient, ContainerClient } from '@azure/storage-blob';

/**
 * BlobStorageClient is an interface that defines the structure of the Azure Blob Storage client.
 * It contains two properties: blobClient and containerClient, which are instances of BlobClient and ContainerClient respectively.
 */
export type BlobStorageClient = BlobStorageClientOptions;

export interface BlobStorageClientOptions {
    /**
     * Blob client to be used by this queue input or output. This is the client that will be used to perform operations on the blob storage.
     */
    blobClient: BlobClient;

    /**
     * Container client to be used by this queue input or output. This is the client that will be used to perform operations on the container storage.
     */
    conatinerClient: ContainerClient;
}
