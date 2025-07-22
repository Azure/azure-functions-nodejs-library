// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { fromString } from 'long';
import { HttpRequest } from '../../src';
import { fromRpcTypedData } from '../../src/converters/fromRpcTypedData';
import Long = require('long');
import { RpcTypedData } from '@azure/functions-core';
import sinon = require('sinon');
import { ResourceFactoryResolver } from '@azure/functions-extensions-base';

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
    // Use SinonSandbox for automatic cleanup of stubs
    let sandbox: sinon.SinonSandbox;

    // Store original ResourceFactoryResolver.getInstance to restore after tests
    let originalGetInstance: typeof ResourceFactoryResolver.getInstance;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Store original method
        originalGetInstance = ResourceFactoryResolver.getInstance.bind(ResourceFactoryResolver);
    });

    afterEach(() => {
        // Restore all stubs and original methods
        sandbox.restore();
        ResourceFactoryResolver.getInstance = originalGetInstance;
    });

    it('should successfully create a client when modelBindingData is valid', () => {
        // Arrange
        const mockClient = {
            name: 'testClient',
            download: () => Promise.resolve({ readableStreamBody: Buffer.from('test') }),
        };

        // Create mock ResourceFactoryResolver
        const mockResolver = {
            createClient: sinon.stub().returns(mockClient),
        };

        // Replace ResourceFactoryResolver.getInstance with our mock
        ResourceFactoryResolver.getInstance = sinon.stub().returns(mockResolver);

        // Create test data
        const modelBindingData = {
            content: Buffer.from('test-content'),
            source: 'blob',
            contentType: 'application/octet-stream',
        };

        const data: RpcTypedData = {
            modelBindingData: modelBindingData,
        };

        // Act
        const result = fromRpcTypedData(data);

        // Assert
        sinon.assert.calledWith(mockResolver.createClient, 'blob', modelBindingData);
        expect(result).to.equal(mockClient);
    });

    it('should handle modelBindingData with undefined source', () => {
        // Arrange
        const mockClient = { name: 'testClient' };

        const mockResolver = {
            createClient: sinon.stub().returns(mockClient),
        };

        ResourceFactoryResolver.getInstance = sinon.stub().returns(mockResolver);

        const modelBindingData = {
            content: Buffer.from('test-content'),
            // No source specified
            contentType: 'application/octet-stream',
        };

        const data: RpcTypedData = {
            modelBindingData: modelBindingData,
        };

        // Act
        const result = fromRpcTypedData(data);

        // Assert
        expect(mockResolver.createClient.calledWith(undefined, modelBindingData)).to.be.true;
        expect(result).to.equal(mockClient);
    });

    it('should throw enhanced error when ResourceFactoryResolver.createClient throws', () => {
        // Arrange
        const originalError = new Error('Factory not registered');

        const mockResolver = {
            createClient: sinon.stub().throws(originalError),
        };

        ResourceFactoryResolver.getInstance = sinon.stub().returns(mockResolver);

        const modelBindingData = {
            content: Buffer.from('test-content'),
            source: 'blob',
            contentType: 'application/octet-stream',
        };

        const data: RpcTypedData = {
            modelBindingData: modelBindingData,
        };

        // Act & Assert
        expect(() => fromRpcTypedData(data)).to.throw(
            'Unable to create client. Please register the extensions library with your function app. ' +
                'Error: Factory not registered'
        );
    });

    it('should throw enhanced error when ResourceFactoryResolver.getInstance throws', () => {
        // Arrange
        const originalError = new Error('Resolver not initialized');

        ResourceFactoryResolver.getInstance = sinon.stub().throws(originalError);

        const modelBindingData = {
            content: Buffer.from('test-content'),
            source: 'blob',
            contentType: 'application/octet-stream',
        };

        const data: RpcTypedData = {
            modelBindingData: modelBindingData,
        };

        // Act & Assert
        expect(() => fromRpcTypedData(data)).to.throw(
            'Unable to create client. Please register the extensions library with your function app. ' +
                'Error: Resolver not initialized'
        );
    });

    it('should handle non-Error exceptions by converting to string', () => {
        // Arrange
        const mockResolver = {
            createClient: sinon.stub().throws('String exception'), // Non-Error exception
        };

        ResourceFactoryResolver.getInstance = sinon.stub().returns(mockResolver);

        const modelBindingData = {
            content: Buffer.from('test-content'),
            source: 'blob',
            contentType: 'application/octet-stream',
        };

        const data: RpcTypedData = {
            modelBindingData: modelBindingData,
        };

        // Act & Assert
        expect(() => fromRpcTypedData(data)).to.throw(
            'Unable to create client. Please register the extensions library with your function app. ' +
                'Error: Sinon-provided String exception'
        );
    });
});
describe('fromRpcTypedData - collectionModelBindingData path', () => {
    let sandbox: sinon.SinonSandbox;
    let originalGetInstance: typeof ResourceFactoryResolver.getInstance;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        originalGetInstance = ResourceFactoryResolver.getInstance.bind(ResourceFactoryResolver);
    });

    afterEach(() => {
        sandbox.restore();
        ResourceFactoryResolver.getInstance = originalGetInstance;
    });

    it('should successfully create a client when collectionModelBindingData is valid', () => {
        const mockClient = { name: 'testCollectionClient' };
        const mockResolver = {
            createClient: sinon.stub().returns(mockClient),
        };
        ResourceFactoryResolver.getInstance = sinon.stub().returns(mockResolver);

        const collectionModelBindingData = {
            modelBindingData: [
                {
                    content: Buffer.from('test-content-1'),
                    source: 'blob',
                    contentType: 'application/octet-stream',
                },
                {
                    content: Buffer.from('test-content-2'),
                    source: 'blob',
                    contentType: 'application/octet-stream',
                },
            ],
        };

        const data: RpcTypedData = {
            collectionModelBindingData,
        };

        const result = fromRpcTypedData(data);

        sinon.assert.calledWith(mockResolver.createClient, 'blob', collectionModelBindingData.modelBindingData);
        expect(result).to.equal(mockClient);
    });

    it('should handle collectionModelBindingData with undefined source', () => {
        const mockClient = { name: 'testCollectionClient' };
        const mockResolver = {
            createClient: sinon.stub().returns(mockClient),
        };
        ResourceFactoryResolver.getInstance = sinon.stub().returns(mockResolver);

        const collectionModelBindingData = {
            modelBindingData: [
                {
                    content: Buffer.from('test-content-1'),
                    // source is undefined
                    contentType: 'application/octet-stream',
                },
            ],
        };

        const data: RpcTypedData = {
            collectionModelBindingData,
        };

        const result = fromRpcTypedData(data);

        expect(mockResolver.createClient.calledWith(undefined, collectionModelBindingData.modelBindingData)).to.be.true;
        expect(result).to.equal(mockClient);
    });

    it('should throw enhanced error when ResourceFactoryResolver.createClient throws for collectionModelBindingData', () => {
        const originalError = new Error('Collection factory not registered');
        const mockResolver = {
            createClient: sinon.stub().throws(originalError),
        };
        ResourceFactoryResolver.getInstance = sinon.stub().returns(mockResolver);

        const collectionModelBindingData = {
            modelBindingData: [
                {
                    content: Buffer.from('test-content-1'),
                    source: 'blob',
                    contentType: 'application/octet-stream',
                },
            ],
        };

        const data: RpcTypedData = {
            collectionModelBindingData,
        };

        expect(() => fromRpcTypedData(data)).to.throw(
            'Unable to create client. Please register the extensions library with your function app. ' +
                'Error: Collection factory not registered'
        );
    });

    it('should throw enhanced error when ResourceFactoryResolver.getInstance throws for collectionModelBindingData', () => {
        const originalError = new Error('Collection resolver not initialized');
        ResourceFactoryResolver.getInstance = sinon.stub().throws(originalError);

        const collectionModelBindingData = {
            modelBindingData: [
                {
                    content: Buffer.from('test-content-1'),
                    source: 'blob',
                    contentType: 'application/octet-stream',
                },
            ],
        };

        const data: RpcTypedData = {
            collectionModelBindingData,
        };

        expect(() => fromRpcTypedData(data)).to.throw(
            'Unable to create client. Please register the extensions library with your function app. ' +
                'Error: Collection resolver not initialized'
        );
    });

    it('should handle non-Error exceptions by converting to string for collectionModelBindingData', () => {
        const mockResolver = {
            createClient: sinon.stub().throws('String exception for collection'), // Non-Error exception
        };
        ResourceFactoryResolver.getInstance = sinon.stub().returns(mockResolver);

        const collectionModelBindingData = {
            modelBindingData: [
                {
                    content: Buffer.from('test-content-1'),
                    source: 'blob',
                    contentType: 'application/octet-stream',
                },
            ],
        };

        const data: RpcTypedData = {
            collectionModelBindingData,
        };

        expect(() => fromRpcTypedData(data)).to.throw(
            'Unable to create client. Please register the extensions library with your function app. ' +
                'Error: Sinon-provided String exception for collection'
        );
    });
});

describe('fromRpcTypedData - fallback/undefined cases', () => {
    it('should return undefined for unknown data shape', () => {
        const data: RpcTypedData = { foo: 'bar' } as any;
        expect(fromRpcTypedData(data)).to.be.undefined;
    });

    it('should return undefined for empty object', () => {
        expect(fromRpcTypedData({} as RpcTypedData)).to.be.undefined;
    });
});
