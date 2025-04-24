// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { TokenCredential } from '@azure/identity';
import { AnonymousCredential, StoragePipelineOptions, StorageSharedKeyCredential } from '@azure/storage-blob';
import { AzureBlobStorageClient } from './azureBlobStorageClient';
import { ConnectionStringStrategy } from './connectionStringStrategy';
import { ExplicitCredentialStrategy } from './explicitCredentialStrategy';
import { ManagedIdentityStrategy } from './managedIdentityStrategy';

/**
 * Factory class to create AzureBlobStorageClient instances.
 */
export class AzureBlobStorageClientFactory {
    /**
     * Creates an AzureBlobStorageClient using a connection string.
     *
     * @param connectionString - The Azure Storage connection string
     * @param containerName - Name of the container
     * @param blobName - Name of the blob
     * @param options - Storage pipeline options
     * @returns A new AzureBlobStorageClient instance
     */
    static fromConnectionString(
        connectionString: string,
        containerName: string,
        blobName: string,
        options?: StoragePipelineOptions
    ): AzureBlobStorageClient {
        const strategy = new ConnectionStringStrategy(connectionString);
        return new AzureBlobStorageClient(strategy, containerName, blobName, options);
    }

    /**
     * Creates an AzureBlobStorageClient using managed identity.
     *
     * @param accountUrl - URL to the storage account (e.g., https://myaccount.blob.core.windows.net)
     * @param containerName - Name of the container
     * @param blobName - Name of the blob
     * @param options - Storage pipeline options
     * @returns A new AzureBlobStorageClient instance
     */
    static fromManagedIdentity(
        accountUrl: string,
        containerName: string,
        blobName: string,
        options?: StoragePipelineOptions
    ): AzureBlobStorageClient {
        const strategy = new ManagedIdentityStrategy(accountUrl);
        return new AzureBlobStorageClient(strategy, containerName, blobName, options);
    }

    /**
     * Creates an AzureBlobStorageClient using explicit credentials.
     *
     * @param accountUrl - URL to the storage account
     * @param credential - The credential to use for authentication
     * @param containerName - Name of the container
     * @param blobName - Name of the blob
     * @param options - Storage pipeline options
     * @returns A new AzureBlobStorageClient instance
     */
    static fromCredential(
        accountUrl: string,
        credential: StorageSharedKeyCredential | AnonymousCredential | TokenCredential,
        containerName: string,
        blobName: string,
        options?: StoragePipelineOptions
    ): AzureBlobStorageClient {
        const strategy = new ExplicitCredentialStrategy(accountUrl, credential);
        return new AzureBlobStorageClient(strategy, containerName, blobName, options);
    }

    /**
     * Creates an AzureBlobStorageClient using account name and key.
     *
     * @param accountName - The storage account name
     * @param accountKey - The storage account key
     * @param containerName - Name of the container
     * @param blobName - Name of the blob
     * @param options - Storage pipeline options
     * @returns A new AzureBlobStorageClient instance
     */
    static fromAccountKey(
        accountName: string,
        accountKey: string,
        containerName: string,
        blobName: string,
        options?: StoragePipelineOptions
    ): AzureBlobStorageClient {
        const credential = new StorageSharedKeyCredential(accountName, accountKey);
        const url = `https://${accountName}.blob.core.windows.net`;
        return this.fromCredential(url, credential, containerName, blobName, options);
    }

    /**
     * Creates an appropriate AzureBlobStorageClient based on the provided connection information.
     *
     * @param connectionInfo - Connection string or storage account URL
     * @param containerName - Name of the container
     * @param blobName - Name of the blob
     * @param credentialOrOptions - Credential or options
     * @param options - Storage pipeline options
     * @returns A new AzureBlobStorageClient instance
     */
    static create(
        connectionInfo: string,
        containerName: string,
        blobName: string,
        credentialOrOptions?:
            | StorageSharedKeyCredential
            | AnonymousCredential
            | TokenCredential
            | StoragePipelineOptions,
        options?: StoragePipelineOptions
    ): AzureBlobStorageClient {
        if (connectionInfo.includes('DefaultEndpointsProtocol') || connectionInfo.includes('AccountKey')) {
            // It's a connection string
            return this.fromConnectionString(
                connectionInfo,
                containerName,
                blobName,
                options || (credentialOrOptions as StoragePipelineOptions)
            );
        } else {
            // It's a URL
            if (
                credentialOrOptions instanceof StorageSharedKeyCredential ||
                credentialOrOptions instanceof AnonymousCredential ||
                'getToken' in (credentialOrOptions || {})
            ) {
                // It's a credential
                return this.fromCredential(
                    connectionInfo,
                    credentialOrOptions as TokenCredential,
                    containerName,
                    blobName,
                    options
                );
            } else {
                // Use managed identity
                return this.fromManagedIdentity(
                    connectionInfo,
                    containerName,
                    blobName,
                    credentialOrOptions as StoragePipelineOptions
                );
            }
        }
    }

    /**
     * Creates a strategy based on the provided parameters.
     * For internal use by the factory methods.
     
    private static createStrategy(
        connectionStringOrUrl: string,
        credentialOrOptions?: StorageSharedKeyCredential | AnonymousCredential | TokenCredential
    ): BlobServiceClientStrategy {
        if (
            connectionStringOrUrl.includes('DefaultEndpointsProtocol') ||
            connectionStringOrUrl.includes('AccountKey')
        ) {
            return new ConnectionStringStrategy(connectionStringOrUrl);
        } else if (credentialOrOptions) {
            return new ExplicitCredentialStrategy(connectionStringOrUrl, credentialOrOptions);
        } else {
            return new ManagedIdentityStrategy(connectionStringOrUrl);
        }
    }
        */
}
