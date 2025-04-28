// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { ModelBindingData } from '@azure/functions-core';
import { StorageBlobClient } from '../../../types/storageBlobClient';
import { BlobConnectionDetails, parseConnectionDetails } from '../connectionDetails';
import { AzureStorageBlobClient } from './azureStorageBlobClient';
import { ConnectionStringStrategy } from './connectionStringStrategy';
import { ManagedIdentitySystemStrategy } from './managedIdentitySystemStrategy';
import { ManagedIdentityUserStrategy } from './managedIdentityUserStartegy';
import { StorageBlobServiceClientStrategy } from './storageBlobServiceClientStrategy';
import { getConnectionString, isSystemBasedManagedIdentity, isUserBasedManagedIdentity } from './utils';

/**
 * Factory class for creating Azure Blob Storage clients
 */
export class AzureStorageBlobClientFactory {
    static buildClientFromModelBindingData(modelBindingData: ModelBindingData): StorageBlobClient {
        const connectionDetails = parseConnectionDetails(modelBindingData.content);
        //TODO Add type check and parsing for other connection types
        return this.fromConnectionDetailsToBlobStorageClient(connectionDetails);
    }

    /**
     * Creates a StorageBlobClient directly from connection parameters
     *
     * @param connectionDetails - Connection details for the blob storage client
     * @returns - StorageBlobClient object containing the blob client and container client
     */
    static fromConnectionDetailsToBlobStorageClient(connectionDetails: BlobConnectionDetails): StorageBlobClient {
        try {
            const connectionName: string = connectionDetails.Connection;
            const connectionUrl = getConnectionString(connectionName);
            const connectionStrategy = this.createConnectionStrategy(connectionName, connectionUrl);

            const azureStorageBlobClient = new AzureStorageBlobClient(
                connectionStrategy,
                connectionDetails.ContainerName,
                connectionDetails.BlobName
            );

            const storageBlobClient: StorageBlobClient = {
                blobClient: azureStorageBlobClient.getBlobClient(),
                conatinerClient: azureStorageBlobClient.getContainerClient(),
            };
            return storageBlobClient;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to create client from parameters: ${errorMessage}`);
        }
    }

    /**
     * Creates the appropriate connection strategy based on the connection name and URL
     *
     * @param connectionName - The connection name
     * @param connectionUrl - The resolved connection URL
     * @returns The appropriate StorageBlobServiceClientStrategy
     */
    static createConnectionStrategy(connectionName: string, connectionUrl: string): StorageBlobServiceClientStrategy {
        // User-assigned managed identity takes precedence
        if (isUserBasedManagedIdentity(connectionName)) {
            const clientId = process.env[`${connectionName}__clientId`];
            if (!clientId) {
                throw new Error(`Environment variable ${connectionName}__clientId is not defined.`);
            }
            console.log(`Using user-assigned managed identity with client ID: ${clientId.substring(0, 8)}...`);
            return new ManagedIdentityUserStrategy(connectionUrl, clientId);
        }

        // Next, check for system-assigned managed identity
        if (isSystemBasedManagedIdentity(connectionName)) {
            console.log('Using system-assigned managed identity for connection');
            return new ManagedIdentitySystemStrategy(connectionUrl);
        }

        // Default to connection string
        console.log('Using connection string authentication');
        return new ConnectionStringStrategy(connectionUrl);
    }
}
