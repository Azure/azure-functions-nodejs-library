// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import { AzureStorageBlobClient } from '../../../src/deferred-binding/storage-blob/azureStorageBlobClient';
import { StorageBlobServiceClientStrategy } from '../../../src/deferred-binding/storage-blob/storageBlobServiceClientStrategy';

class MockBlobServiceClient {
    getContainerClient(containerName: string): any {
        return {
            name: containerName,
            getBlobClient: (blobName: string) => ({
                name: blobName,
                url: `https://test.blob.core.windows.net/${containerName}/${blobName}`,
            }),
            getContainerClient: (conatinerName: string) => ({
                containerName: conatinerName,
                url: `https://test.blob.core.windows.net/${containerName}`,
            }),
        };
    }
}

class MockStrategy implements StorageBlobServiceClientStrategy {
    createStorageBlobServiceClient(): any {
        return new MockBlobServiceClient();
    }
}

describe('AzureStorageBlobClient', () => {
    let mockStrategy: MockStrategy;

    beforeEach(() => {
        mockStrategy = new MockStrategy();
    });

    it('should create container client when container name is provided', () => {
        // Arrange
        const containerName = 'test-container';

        // Act
        const client = new AzureStorageBlobClient(mockStrategy, containerName);

        // Assert
        const containerClient = client.getContainerClient();
        expect(containerClient).to.exist;
        // expect(containerClient.containerName).to.equal(containerName);
        // expect(containerClient.url).to.include(containerName);
    });

    it('should create blob client when container and blob names are provided', () => {
        // Arrange
        const containerName = 'test-container';
        const blobName = 'test-blob.txt';

        // Act
        const client = new AzureStorageBlobClient(mockStrategy, containerName, blobName);

        // Assert
        const blobClient = client.getBlobClient();
        expect(blobClient).to.exist;
        expect(blobClient.name).to.equal(blobName);
        expect(blobClient.url).to.include(containerName);
        expect(blobClient.url).to.include(blobName);
    });

    it('should throw error when getting blob client without providing blob name', () => {
        // Arrange
        const containerName = 'test-container';
        const client = new AzureStorageBlobClient(mockStrategy, containerName);

        // Act & Assert
        expect(() => client.getBlobClient()).to.throw('No blob client available');
    });

    it('should throw error when getting container client without providing container name', () => {
        // Arrange
        const client = new AzureStorageBlobClient(mockStrategy);

        // Act & Assert
        expect(() => client.getContainerClient()).to.throw('No container client available');
    });

    it('should pass options to blob service client creation', () => {
        // Arrange
        const containerName = 'test-container';
        const blobName = 'test-blob.txt';
        const options = { retryOptions: { maxTries: 5 } };

        // Create a spy on the strategy
        const strategySpy = {
            createStorageBlobServiceClient: (opts: any): any => {
                // Store the options for assertion
                strategySpy.lastOptions = opts;
                return new MockBlobServiceClient();
            },
            lastOptions: undefined as any,
        };

        // Act
        new AzureStorageBlobClient(strategySpy as any, containerName, blobName, options);

        // Assert
        expect(strategySpy.lastOptions).to.equal(options);
    });
});
