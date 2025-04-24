// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { ModelBindingData } from '@azure/functions-core';
import { BlobStorageClient } from '../../types/blobStorageClient';
import { BlobConnectionDetails, parseConnectionDetails } from './connectionDetails';
import { AzureBlobStorageClient } from './storage-blob/azureBlobStorageClient';
import { ConnectionStringStrategy } from './storage-blob/connectionStringStrategy';

export function buildClientFromModelBindingData(modelBindingData: ModelBindingData): BlobStorageClient {
    const connectionDetails = parseConnectionDetails(modelBindingData.content);
    //TODO Add type check and parsing for other connection types
    return createBlobStorageClient(connectionDetails);
}

/**
 * Function to create a BlobStorageClient object
 * @param connectionDetails - Connection details for the blob storage client
 * @returns - BlobStorageClient object containing the blob client and container client
 */
function createBlobStorageClient(connectionDetails: BlobConnectionDetails): BlobStorageClient {
    //TODO Add logic for managed Identity and other connection types
    const connectionStrategy = new ConnectionStringStrategy(connectionDetails.Connection);
    const azureBlobStorageClient = new AzureBlobStorageClient(
        connectionStrategy,
        connectionDetails.ContainerName,
        connectionDetails.BlobName
    );
    const blobStorageClient: BlobStorageClient = {
        blobClient: azureBlobStorageClient.getBlobClient(),
        conatinerClient: azureBlobStorageClient.getContainerClient(),
    };
    return blobStorageClient;
}
