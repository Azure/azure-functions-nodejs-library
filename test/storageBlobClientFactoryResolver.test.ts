// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import { StorageBlobClientFactoryResolver } from '../src/storageBlobClientFactoryResolver';
import { Disposable } from '../src/utils/Disposable';
import { StorageBlobClientOptions } from '../types';

describe('StorageBlobClientFactoryResolver', () => {
    // Store reference to original instance for cleanup
    let originalInstance: StorageBlobClientFactoryResolver | undefined;

    before(() => {
        // Save original instance if it exists (for restoration after tests)
        originalInstance = (StorageBlobClientFactoryResolver as any).instance;
    });

    afterEach(() => {
        // Reset the singleton instance between tests to ensure test isolation
        (StorageBlobClientFactoryResolver as any).instance = undefined;

        // Make sure any factory is unregistered
        try {
            StorageBlobClientFactoryResolver.getInstance().unregisterFactory();
        } catch (error) {
            // Ignore errors during cleanup
        }
    });

    after(() => {
        // Restore original instance if there was one
        if (originalInstance) {
            (StorageBlobClientFactoryResolver as any).instance = originalInstance;
        }
    });

    describe('getInstance', () => {
        it('should return the same instance when called multiple times', () => {
            // Arrange & Act
            const instance1 = StorageBlobClientFactoryResolver.getInstance();
            const instance2 = StorageBlobClientFactoryResolver.getInstance();

            // Assert
            expect(instance1).to.equal(instance2);
        });

        it('should create a new instance when one does not exist', () => {
            // Arrange
            (StorageBlobClientFactoryResolver as any).instance = undefined;

            // Act
            const instance = StorageBlobClientFactoryResolver.getInstance();

            // Assert
            expect(instance).to.be.instanceOf(StorageBlobClientFactoryResolver);
        });
    });

    describe('registerFactory', () => {
        it('should register a factory successfully', () => {
            // Arrange
            const resolver = StorageBlobClientFactoryResolver.getInstance();
            const mockFactory = () => ({ mockClient: true });

            // Act
            resolver.registerFactory(mockFactory);

            // Assert
            expect(resolver.hasFactory()).to.be.true;
        });

        it('should throw when attempting to register a factory when one is already registered', () => {
            // Arrange
            const resolver = StorageBlobClientFactoryResolver.getInstance();
            const mockFactory1 = () => ({ mockClient1: true });
            const mockFactory2 = () => ({ mockClient2: true });

            // Act & Assert
            resolver.registerFactory(mockFactory1);
            expect(() => resolver.registerFactory(mockFactory2)).to.throw(
                'A StorageBlobClient factory is already registered. Unregister the existing factory first.'
            );
        });
    });

    describe('unregisterFactory', () => {
        it('should unregister a factory successfully', () => {
            // Arrange
            const resolver = StorageBlobClientFactoryResolver.getInstance();
            const mockFactory = () => ({ mockClient: true });
            resolver.registerFactory(mockFactory);

            // Act
            resolver.unregisterFactory();

            // Assert
            expect(resolver.hasFactory()).to.be.false;
        });

        it('should do nothing when unregistering and no factory is registered', () => {
            // Arrange
            const resolver = StorageBlobClientFactoryResolver.getInstance();

            // Act & Assert (should not throw)
            resolver.unregisterFactory();
            expect(resolver.hasFactory()).to.be.false;
        });
    });

    describe('createClient', () => {
        it('should create a client using the registered factory', () => {
            // Arrange
            const resolver = StorageBlobClientFactoryResolver.getInstance();
            const mockClientResult = { blobClient: { name: 'test-blob' }, containerClient: { name: 'test-container' } };
            let capturedOptions: StorageBlobClientOptions | undefined;

            const mockFactory = (options: StorageBlobClientOptions) => {
                capturedOptions = options;
                return mockClientResult;
            };

            resolver.registerFactory(mockFactory);

            const options: StorageBlobClientOptions = {
                connection: 'test-connection',
                containerName: 'test-container',
                blobName: 'test-blob.txt',
            };

            // Act
            const result = resolver.createClient(options);

            // Assert
            expect(result).to.equal(mockClientResult);
            expect(capturedOptions).to.equal(options);
        });

        it('should throw when creating client with no factory registered', () => {
            // Arrange
            const resolver = StorageBlobClientFactoryResolver.getInstance();
            const options: StorageBlobClientOptions = {
                connection: 'test-connection',
                containerName: 'test-container',
                blobName: 'test-blob.txt',
            };

            // Act & Assert
            expect(() => resolver.createClient(options)).to.throw(
                'StorageBlobClient factory is not registered. Register a factory implementation before creating clients.'
            );
        });
    });

    describe('hasFactory', () => {
        it('should return true when factory is registered', () => {
            // Arrange
            const resolver = StorageBlobClientFactoryResolver.getInstance();
            const mockFactory = () => ({ mockClient: true });

            // Act
            resolver.registerFactory(mockFactory);

            // Assert
            expect(resolver.hasFactory()).to.be.true;
        });

        it('should return false when no factory is registered', () => {
            // Arrange
            const resolver = StorageBlobClientFactoryResolver.getInstance();

            // Act & Assert
            expect(resolver.hasFactory()).to.be.false;
        });
    });

    describe('Integration with Disposable pattern', () => {
        it('should support the Disposable pattern for cleanup', () => {
            // Arrange
            const resolver = StorageBlobClientFactoryResolver.getInstance();
            const mockFactory = () => ({ mockClient: true });
            resolver.registerFactory(mockFactory);

            // Act
            const disposable = Disposable.from({
                dispose: () => resolver.unregisterFactory(),
            });

            expect(resolver.hasFactory()).to.be.true;
            disposable.dispose();

            // Assert
            expect(resolver.hasFactory()).to.be.false;
        });
    });
});
