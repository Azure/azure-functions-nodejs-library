// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as storageBlob from '@azure/storage-blob';
import { expect } from 'chai';
import { ManagedIdentityUserStrategy } from '../../../src/deferred-binding/storage-blob/managedIdentityUserStartegy';
import sinon = require('sinon');

describe('ManagedIdentityUserStrategy', () => {
    let sandbox: sinon.SinonSandbox;
    let blobServiceClientConstructorStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // For BlobServiceClient constructor
        const mockBlobServiceClient = { name: 'mockBlobServiceClient' };
        blobServiceClientConstructorStub = sandbox
            .stub(storageBlob, 'BlobServiceClient')
            .returns(mockBlobServiceClient as any);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create BlobServiceClient with ManagedIdentityCredential and clientId', () => {
        // Arrange
        const url = 'https://teststorage.blob.core.windows.net';
        const clientId = '12345678-1234-1234-1234-123456789012';

        // Act
        const strategy = new ManagedIdentityUserStrategy(url, clientId);
        const result = strategy.createStorageBlobServiceClient();

        // Assert
        //Added to remove the eslint error
        console.log(result);
        expect(blobServiceClientConstructorStub.calledOnce).to.be.true;
        expect(blobServiceClientConstructorStub.firstCall.args[0]).to.equal(url);
    });

    it('should pass options when creating BlobServiceClient', () => {
        // Arrange
        const url = 'https://teststorage.blob.core.windows.net';
        const clientId = '12345678-1234-1234-1234-123456789012';
        const options = { retryOptions: { maxTries: 5 } };

        // Act
        const strategy = new ManagedIdentityUserStrategy(url, clientId);
        const result = strategy.createStorageBlobServiceClient(options);

        // Assert
        //Added to remove the eslint error
        console.log(result);
        expect(blobServiceClientConstructorStub.firstCall.args[2]).to.equal(options);
    });
});
