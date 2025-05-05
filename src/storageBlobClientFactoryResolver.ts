// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { StorageBlobClientFactory, StorageBlobClientOptions } from '../types';

/**
 * Registry for Storage Blob Client factory implementations.
 * Manages the registration and retrieval of blob client factories across the application.
 *
 * @example
 * ```typescript
 * // Register a factory
 * StorageBlobClientRegistry.getInstance().registerFactory((options) => {
 *   return new MyCustomBlobClient(options.connection, options.path);
 * });
 *
 * // Create a blob client
 * const blobClient = StorageBlobClientRegistry.getInstance().createClient({
 *   connection: "MyStorageConnection",
 *   path: "container/blob.txt"
 * });
 * ```
 */
export class StorageBlobClientFactoryResolver {
    private static instance: StorageBlobClientFactoryResolver;
    private factory: StorageBlobClientFactory | undefined;

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        // Initialize as needed
    }

    /**
     * Gets the singleton instance of the registry
     * @returns The singleton instance
     */
    static getInstance(): StorageBlobClientFactoryResolver {
        if (!StorageBlobClientFactoryResolver.instance) {
            StorageBlobClientFactoryResolver.instance = new StorageBlobClientFactoryResolver();
        }
        return StorageBlobClientFactoryResolver.instance;
    }

    /**
     * Registers a factory implementation to create Storage Blob Clients
     * @param factory - The factory function implementation
     * @throws Error if a factory is already registered
     */
    registerFactory(factory: StorageBlobClientFactory): void {
        if (this.factory) {
            throw new Error(
                'A StorageBlobClient factory is already registered. Unregister the existing factory first.'
            );
        }
        this.factory = factory;
    }

    /**
     * Unregisters the current factory implementation
     */
    unregisterFactory(): void {
        this.factory = undefined;
    }

    /**
     * Creates a Storage Blob Client using the registered factory
     * @param options - Options for creating the Storage Blob Client
     * @returns The created Storage Blob Client
     * @throws Error if no factory is registered
     */
    createClient(options: StorageBlobClientOptions): unknown {
        if (!this.factory) {
            throw new Error(
                'StorageBlobClient factory is not registered. Register a factory implementation before creating clients.'
            );
        }
        return this.factory(options);
    }

    /**
     * Checks if a factory is registered
     * @returns true if a factory is registered, false otherwise
     */
    hasFactory(): boolean {
        return this.factory !== undefined;
    }
}
