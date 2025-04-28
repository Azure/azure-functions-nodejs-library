// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as storageBlob from '@azure/storage-blob';
import { expect } from 'chai';
import { ConnectionStringStrategy } from '../../../src/deferred-binding/storage-blob/connectionStringStrategy';
import sinon = require('sinon');

describe('ConnectionStringStrategy', () => {
    let sandbox: sinon.SinonSandbox;
    let fromConnectionStringStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Create stub for BlobServiceClient.fromConnectionString
        fromConnectionStringStub = sandbox.stub(storageBlob.BlobServiceClient, 'fromConnectionString');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create BlobServiceClient from connection string', () => {
        // Arrange
        const connectionString =
            'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=key==;EndpointSuffix=core.windows.net';
        const mockBlobServiceClient = { name: 'mockBlobServiceClient' };
        fromConnectionStringStub.returns(mockBlobServiceClient);

        // Act
        const strategy = new ConnectionStringStrategy(connectionString);
        const result = strategy.createStorageBlobServiceClient();

        // Assert
        expect(fromConnectionStringStub.calledOnce).to.be.true;
        expect(fromConnectionStringStub.firstCall.args[0]).to.equal(connectionString);
        expect(result).to.equal(mockBlobServiceClient);
    });

    it('should pass options when creating BlobServiceClient', () => {
        // Arrange
        const connectionString =
            'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=key==;EndpointSuffix=core.windows.net';
        const options = { retryOptions: { maxTries: 5 } };
        const mockBlobServiceClient = { name: 'mockBlobServiceClient' };
        fromConnectionStringStub.returns(mockBlobServiceClient);

        // Act
        const strategy = new ConnectionStringStrategy(connectionString);
        const result = strategy.createStorageBlobServiceClient(options);

        // Assert
        expect(fromConnectionStringStub.calledOnce).to.be.true;
        expect(fromConnectionStringStub.firstCall.args[1]).to.equal(options);
        expect(result).to.equal(mockBlobServiceClient);
    });
});
