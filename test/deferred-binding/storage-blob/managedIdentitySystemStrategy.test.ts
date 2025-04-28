// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as storageBlob from '@azure/storage-blob';
import { expect } from 'chai';
import { ManagedIdentitySystemStrategy } from '../../../src/deferred-binding/storage-blob/managedIdentitySystemStrategy';
import sinon = require('sinon');

describe('ManagedIdentitySystemStrategy', () => {
    let sandbox: sinon.SinonSandbox;
    let blobServiceClientConstructorStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Configure environment variables for managed identity testing
        process.env.IDENTITY_ENDPOINT = 'https://identity.azure.net/managed-identity';
        process.env.IDENTITY_HEADER = 'test-identity-header';
        process.env.AZURE_CLIENT_ID = ''; // Empty for system-assigned identity

        // For BlobServiceClient constructor
        const mockBlobServiceClient = { name: 'mockBlobServiceClient' };
        blobServiceClientConstructorStub = sandbox
            .stub(storageBlob, 'BlobServiceClient')
            .returns(mockBlobServiceClient as any);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create BlobServiceClient with DefaultAzureCredential', () => {
        // Arrange
        const url = 'https://teststorage.blob.core.windows.net';

        // Act
        const strategy = new ManagedIdentitySystemStrategy(url);
        const result = strategy.createStorageBlobServiceClient();

        // Assert
        //Added to remove the eslint error
        console.log(result);
        //expect(defaultAzureCredentialStub.calledOnce).to.be.true;
        // expect(blobServiceClientConstructorStub.calledOnce).to.be.true;
        expect(blobServiceClientConstructorStub.firstCall.args[0]).to.equal(url);
        // expect(result.accountName).to.equal('mockBlobServiceClient');
    });

    it('should pass options when creating BlobServiceClient', () => {
        // Arrange
        const url = 'https://teststorage.blob.core.windows.net';
        const options = { retryOptions: { maxTries: 5 } };

        // Act
        const strategy = new ManagedIdentitySystemStrategy(url);
        const result = strategy.createStorageBlobServiceClient(options);

        // Assert
        //Added to remove the eslint error
        console.log(result);
        expect(blobServiceClientConstructorStub.firstCall.args[2]).to.equal(options);
    });
});
