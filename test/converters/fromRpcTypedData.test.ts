// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { fromString } from 'long';
import { HttpRequest } from '../../src';
import { fromRpcTypedData } from '../../src/converters/fromRpcTypedData';
import Long = require('long');
import { ModelBindingData, RpcTypedData } from '@azure/functions-core';
import sinon = require('sinon');
import * as storageBlobClientFactoryResolverModule from '@azure/functions-extensions-base';
import * as connectionDetailsModule from '../../src/sdk-binding/connectionDetails';

describe('fromRpcTypedData', () => {
    it('null', () => {
        expect(fromRpcTypedData(null)).to.be.undefined;
        expect(fromRpcTypedData(undefined)).to.be.undefined;
    });

    it('string', () => {
        expect(fromRpcTypedData({ string: 'test' })).to.equal('test');
        expect(fromRpcTypedData({ string: '{ "a": "b" }' })).to.deep.equal({ a: 'b' });
        expect(fromRpcTypedData({ string: '{ "a": "b" ' })).to.equal('{ "a": "b" ');
        expect(fromRpcTypedData({ string: '[1,2]' })).to.deep.equal([1, 2]);
        expect(fromRpcTypedData({ string: 'true' })).to.equal(true);
        expect(fromRpcTypedData({ string: 'false' })).to.equal(false);
        expect(fromRpcTypedData({ string: '1' })).to.equal(1);
        expect(fromRpcTypedData({ string: '0' })).to.equal(0);
    });

    it('json', () => {
        expect(fromRpcTypedData({ json: '{ "a": "b" }' })).to.deep.equal({ a: 'b' });
        expect(fromRpcTypedData({ json: '[1,2]' })).to.deep.equal([1, 2]);
        expect(fromRpcTypedData({ json: 'true' })).to.be.true;
        expect(fromRpcTypedData({ json: 'false' })).to.be.false;
        expect(fromRpcTypedData({ json: '1' })).to.equal(1);
        expect(fromRpcTypedData({ json: '0' })).to.equal(0);
        expect(() => fromRpcTypedData({ json: '{ "a": "b" ' })).to.throw(/json/i);
    });

    it('bytes', () => {
        const result: any = fromRpcTypedData({ bytes: new Uint8Array([116, 101, 115, 116]) });
        expect(result).to.be.instanceOf(Buffer);
        expect(result.toString()).to.equal('test');
    });

    it('stream', () => {
        const result: any = fromRpcTypedData({ stream: new Uint8Array([116, 101, 115, 116]) });
        expect(result).to.be.instanceOf(Buffer);
        expect(result.toString()).to.equal('test');
    });

    it('http', async () => {
        const result: any = fromRpcTypedData({
            http: {
                method: 'POST',
                body: {
                    bytes: new Uint8Array([116, 101, 115, 116]),
                },
                url: 'http://microsoft.com',
            },
        });
        expect(result).to.be.instanceOf(HttpRequest);
        expect(await result.text()).to.equal('test');
        expect(result.url).to.equal('http://microsoft.com/');
    });

    it('int', () => {
        expect(fromRpcTypedData({ int: 1 })).to.equal(1);
        expect(fromRpcTypedData({ int: 0 })).to.equal(0);
    });

    it('double', () => {
        expect(fromRpcTypedData({ double: 1 })).to.equal(1);
        expect(fromRpcTypedData({ double: 1.3 })).to.equal(1.3);
        expect(fromRpcTypedData({ double: 0 })).to.equal(0);
    });

    it('collectionBytes', () => {
        const test1 = new Uint8Array([116, 101, 115, 116, 49]);
        const test2 = new Uint8Array([116, 101, 115, 116, 50]);
        const result: any = fromRpcTypedData({ collectionBytes: { bytes: [test1, test2] } });
        expect(result[0]).to.be.instanceOf(Buffer);
        expect(result[0].toString()).to.equal('test1');
        expect(result[1]).to.be.instanceOf(Buffer);
        expect(result[1].toString()).to.equal('test2');
    });

    it('collectionString', () => {
        expect(fromRpcTypedData({ collectionString: { string: ['test1', 'test2'] } })).to.deep.equal([
            'test1',
            'test2',
        ]);
        expect(fromRpcTypedData({ collectionString: { string: ['{"a": "b"}', 'test2'] } })).to.deep.equal([
            { a: 'b' },
            'test2',
        ]);
        expect(fromRpcTypedData({ collectionString: { string: ['{"a": "b"', 'test2'] } })).to.deep.equal([
            '{"a": "b"',
            'test2',
        ]);
    });

    it('collectionDouble', () => {
        const result: any = fromRpcTypedData({ collectionDouble: { double: [1.1, 2.2] } });
        expect(result).to.deep.equal([1.1, 2.2]);
    });

    it('collectionSint64', () => {
        const result: any = fromRpcTypedData({ collectionSint64: { sint64: [123, fromString('9007199254740992')] } });
        expect(result[0]).to.equal(123);
        expect(result[1]).to.be.instanceOf(Long);
        expect(result[1].toString()).to.equal('9007199254740992');
    });
});

describe('fromRpcTypedData - modelBindingData path', () => {
    let sandbox: sinon.SinonSandbox;
    let isModelBindingDataStub: sinon.SinonStub;
    let parseConnectionDetailsStub: sinon.SinonStub;
    let createClientStub: sinon.SinonStub;
    let mockFactoryResolver: any;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock isModelBindingData
        isModelBindingDataStub = sandbox.stub(connectionDetailsModule, 'isModelBindingData');

        // Mock parseConnectionDetails
        parseConnectionDetailsStub = sandbox.stub(connectionDetailsModule, 'parseConnectionDetails');

        // Create a mock resolver with a stub createClient method
        mockFactoryResolver = {
            createClient: sandbox.stub(),
        };

        // Mock the getInstance method to return our mock resolver
        sandbox
            .stub(storageBlobClientFactoryResolverModule.StorageBlobClientFactoryResolver, 'getInstance')
            .returns(mockFactoryResolver);

        // Store reference to createClient stub for ease of use
        createClientStub = mockFactoryResolver.createClient;
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create a blob client when provided with valid model binding data', () => {
        // Arrange
        const modelBindingData: ModelBindingData = {
            content: Buffer.from(
                JSON.stringify({
                    Connection: 'test-connection',
                    ContainerName: 'test-container',
                    BlobName: 'test-blob.txt',
                })
            ),
            contentType: 'application/json',
        };

        const rpcTypedData: RpcTypedData = { modelBindingData };

        isModelBindingDataStub.returns(true);
        parseConnectionDetailsStub.returns({
            Connection: 'test-connection',
            ContainerName: 'test-container',
            BlobName: 'test-blob.txt',
        });

        const mockBlobClient = {
            name: 'mockBlobClient',
            download: () => {},
        };
        createClientStub.returns(mockBlobClient);

        // Act
        const result = fromRpcTypedData(rpcTypedData);

        // Assert
        expect(isModelBindingDataStub.calledOnce).to.be.true;
        expect(isModelBindingDataStub.calledWith(modelBindingData)).to.be.true;

        expect(parseConnectionDetailsStub.calledOnce).to.be.true;
        expect(parseConnectionDetailsStub.calledWith(modelBindingData.content)).to.be.true;

        expect(createClientStub.calledOnce).to.be.true;
        expect(createClientStub.firstCall.args[0]).to.deep.equal({
            connection: 'test-connection',
            containerName: 'test-container',
            blobName: 'test-blob.txt',
        });

        expect(result).to.equal(mockBlobClient);
    });

    it('should handle when isModelBindingData returns false', () => {
        // Arrange
        const modelBindingData: ModelBindingData = {
            content: Buffer.from('invalid-content'),
            contentType: 'text/plain',
        };

        const rpcTypedData: RpcTypedData = { modelBindingData };

        isModelBindingDataStub.returns(false);

        // Act
        const result = fromRpcTypedData(rpcTypedData);

        // Assert
        expect(isModelBindingDataStub.calledOnce).to.be.true;
        expect(parseConnectionDetailsStub.called).to.be.false;
        expect(createClientStub.called).to.be.false;

        // Should return the modelBindingData as-is
        expect(result).to.equal(modelBindingData);
    });

    it('should propagate errors from parseConnectionDetails', () => {
        // Arrange
        const modelBindingData: ModelBindingData = {
            content: Buffer.from('invalid-json'),
            contentType: 'application/json',
        };

        const rpcTypedData: RpcTypedData = { modelBindingData };

        isModelBindingDataStub.returns(true);
        parseConnectionDetailsStub.throws(new Error('Invalid JSON format'));

        // Act & Assert
        expect(() => fromRpcTypedData(rpcTypedData)).to.throw('Invalid JSON format');
        expect(createClientStub.called).to.be.false;
    });

    it('should propagate errors from createClient', () => {
        // Arrange
        const modelBindingData: ModelBindingData = {
            content: Buffer.from(
                JSON.stringify({
                    Connection: 'test-connection',
                    ContainerName: 'test-container',
                    BlobName: 'test-blob.txt',
                })
            ),
            contentType: 'application/json',
        };

        const rpcTypedData: RpcTypedData = { modelBindingData };

        isModelBindingDataStub.returns(true);
        parseConnectionDetailsStub.returns({
            Connection: 'test-connection',
            ContainerName: 'test-container',
            BlobName: 'test-blob.txt',
        });

        createClientStub.throws(new Error('Factory not registered'));

        // Act & Assert
        expect(() => fromRpcTypedData(rpcTypedData)).to.throw('Factory not registered');
    });

    it('should handle undefined modelBindingData content', () => {
        // Arrange
        const modelBindingData: ModelBindingData = {
            // Missing content
            contentType: 'application/json',
        };

        const rpcTypedData: RpcTypedData = { modelBindingData };

        // Act
        const result = fromRpcTypedData(rpcTypedData);

        // Assert
        expect(isModelBindingDataStub.called).to.be.false;
        expect(parseConnectionDetailsStub.called).to.be.false;
        expect(createClientStub.called).to.be.false;

        expect(result).to.be.undefined;
    });

    it('should handle special characters in blob names', () => {
        // Arrange
        const blobName = 'special/char+blob#name.txt';
        const modelBindingData: ModelBindingData = {
            content: Buffer.from(
                JSON.stringify({
                    Connection: 'test-connection',
                    ContainerName: 'test-container',
                    BlobName: blobName,
                })
            ),
            contentType: 'application/json',
        };

        const rpcTypedData: RpcTypedData = { modelBindingData };

        isModelBindingDataStub.returns(true);
        parseConnectionDetailsStub.returns({
            Connection: 'test-connection',
            ContainerName: 'test-container',
            BlobName: blobName,
        });

        const mockBlobClient = {
            name: blobName,
            download: () => {},
        };
        createClientStub.returns(mockBlobClient);

        // Act
        const result = fromRpcTypedData(rpcTypedData);

        // Assert
        expect(createClientStub.firstCall.args[0].blobName).to.equal(blobName);
        expect(result).to.equal(mockBlobClient);
    });
});
