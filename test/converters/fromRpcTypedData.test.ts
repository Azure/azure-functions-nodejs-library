// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { fromString } from 'long';
import { HttpRequest } from '../../src';
import { fromRpcTypedData } from '../../src/converters/fromRpcTypedData';
import Long = require('long');
import { ModelBindingData, RpcTypedData } from '@azure/functions-core';
import { AzureStorageBlobClientFactory } from '../../src/deferred-binding/storage-blob/azureStorageBlobClientFactory';

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

describe('modelBindingData scenario', () => {
    let mockBlobClient: any;

    beforeEach(() => {
        // Suppress console.log output during tests
        console.log = () => {};

        // Create mock blob client for testing
        mockBlobClient = {
            blobClient: { url: 'https://test.blob.core.windows.net/container/blob' },
            containerClient: { url: 'https://test.blob.core.windows.net/container' },
        };

        // Replace the factory method with a mock implementation
        AzureStorageBlobClientFactory.buildClientFromModelBindingData = () => {
            return mockBlobClient;
        };
    });

    it('should call AzureStorageBlobClientFactory with modelBindingData', () => {
        let capturedModelBindingData: ModelBindingData | null = null;

        // Override the mock to capture the input parameter
        AzureStorageBlobClientFactory.buildClientFromModelBindingData = (modelBindingData: ModelBindingData) => {
            capturedModelBindingData = modelBindingData;
            return mockBlobClient;
        };

        const modelBindingData: ModelBindingData = {
            content: Buffer.from(
                JSON.stringify({
                    Connection: 'test-connection',
                    ContainerName: 'test-container',
                    BlobName: 'test-blob.txt',
                })
            ),
            contentType: 'application/json',
            source: 'test-source',
            version: '1.0',
        };

        const data: RpcTypedData = { modelBindingData };

        const result = fromRpcTypedData(data);

        // Verify the factory was called with the correct data
        expect(capturedModelBindingData).to.equal(modelBindingData);

        // Verify the result is what the factory returned
        expect(result).to.equal(mockBlobClient);
    });

    it('should handle undefined content in modelBindingData', () => {
        // Override mock to throw if called with incorrect data
        AzureStorageBlobClientFactory.buildClientFromModelBindingData = () => {
            throw new Error('Should not be called with undefined content');
        };

        const modelBindingData: ModelBindingData = {
            // content is undefined
            contentType: 'application/json',
        };

        const data: RpcTypedData = { modelBindingData };

        // This should not throw because the isDefined check should prevent the factory from being called
        const result = fromRpcTypedData(data);
        expect(result).to.be.undefined;
    });
});
