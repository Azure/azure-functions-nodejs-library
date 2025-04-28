// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import {
    getConnectionString,
    isSystemBasedManagedIdentity,
    isUserBasedManagedIdentity,
} from '../../../src/deferred-binding/storage-blob/utils';

describe('Storage Blob Utils', () => {
    // Store original env vars
    const originalEnv = { ...process.env };

    beforeEach(() => {
        // Clear relevant environment variables before each test
        delete process.env['TestConnection'];
        delete process.env['TestConnection__serviceUri'];
        delete process.env['TestConnection__blobServiceUri'];
        delete process.env['TestConnection__clientId'];
        delete process.env['TestConnection__credential'];
    });

    afterEach(() => {
        // Restore original env vars
        process.env = { ...originalEnv };
    });

    describe('getConnectionString', () => {
        it('should throw when connection string is undefined', () => {
            expect(() => getConnectionString(undefined)).to.throw(
                'Storage account connection string cannot be undefined. Please provide a connection string.'
            );
        });

        it('should return direct connection string when available', () => {
            // Arrange
            const expectedValue =
                'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=abc123==;EndpointSuffix=core.windows.net';
            process.env['TestConnection'] = expectedValue;

            // Act
            const result = getConnectionString('TestConnection');

            // Assert
            expect(result).to.equal(expectedValue);
        });

        it('should return service URI when using managed identity with blob input', () => {
            // Arrange
            const expectedValue = 'https://teststorage.blob.core.windows.net';
            process.env['TestConnection__serviceUri'] = expectedValue;

            // Act
            const result = getConnectionString('TestConnection');

            // Assert
            expect(result).to.equal(expectedValue);
        });

        it('should return blob service URI when using managed identity with blob trigger', () => {
            // Arrange
            const expectedValue = 'https://teststorage.blob.core.windows.net';
            process.env['TestConnection__blobServiceUri'] = expectedValue;

            // Act
            const result = getConnectionString('TestConnection');

            // Assert
            expect(result).to.equal(expectedValue);
        });

        it('should throw when connection string does not exist in environment variables', () => {
            expect(() => getConnectionString('NonExistentConnection')).to.throw(
                'Storage account connection string NonExistentConnection does not exist. ' +
                    'Please make sure that it is a defined environment variable.'
            );
        });

        it('should prioritize direct connection string over service URI variants', () => {
            // Arrange - set all three possible environment variables
            const expectedValue =
                'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=abc123==;EndpointSuffix=core.windows.net';
            process.env['TestConnection'] = expectedValue;
            process.env['TestConnection__serviceUri'] = 'https://wrong.blob.core.windows.net';
            process.env['TestConnection__blobServiceUri'] = 'https://alsowrong.blob.core.windows.net';

            // Act
            const result = getConnectionString('TestConnection');

            // Assert
            expect(result).to.equal(expectedValue);
        });
    });

    describe('isSystemBasedManagedIdentity', () => {
        it('should return true when service URI is defined', () => {
            // Arrange
            process.env['TestConnection__serviceUri'] = 'https://teststorage.blob.core.windows.net';

            // Act & Assert
            expect(isSystemBasedManagedIdentity('TestConnection')).to.be.true;
        });

        it('should return true when blob service URI is defined', () => {
            // Arrange
            process.env['TestConnection__blobServiceUri'] = 'https://teststorage.blob.core.windows.net';

            // Act & Assert
            expect(isSystemBasedManagedIdentity('TestConnection')).to.be.true;
        });

        it('should return false when neither URI is defined', () => {
            // Act & Assert
            expect(isSystemBasedManagedIdentity('TestConnection')).to.be.false;
        });

        it('should return true when both URI variants are defined', () => {
            // Arrange
            process.env['TestConnection__serviceUri'] = 'https://teststorage.blob.core.windows.net';
            process.env['TestConnection__blobServiceUri'] = 'https://teststorage.blob.core.windows.net';

            // Act & Assert
            expect(isSystemBasedManagedIdentity('TestConnection')).to.be.true;
        });
    });

    describe('isUserBasedManagedIdentity', () => {
        it('should return true when all required properties are defined', () => {
            // Arrange
            process.env['TestConnection__clientId'] = '11111111-1111-1111-1111-111111111111';
            process.env['TestConnection__credential'] = 'managedidentity';
            process.env['TestConnection__serviceUri'] = 'https://teststorage.blob.core.windows.net';

            // Act & Assert
            expect(isUserBasedManagedIdentity('TestConnection')).to.be.true;
        });

        it('should return false when clientId is missing', () => {
            // Arrange
            process.env['TestConnection__credential'] = 'managedidentity';
            process.env['TestConnection__serviceUri'] = 'https://teststorage.blob.core.windows.net';

            // Act & Assert
            expect(isUserBasedManagedIdentity('TestConnection')).to.be.false;
        });

        it('should return false when credential is missing', () => {
            // Arrange
            process.env['TestConnection__clientId'] = '11111111-1111-1111-1111-111111111111';
            process.env['TestConnection__serviceUri'] = 'https://teststorage.blob.core.windows.net';

            // Act & Assert
            expect(isUserBasedManagedIdentity('TestConnection')).to.be.false;
        });

        it('should return false when serviceUri is missing', () => {
            // Arrange
            process.env['TestConnection__clientId'] = '11111111-1111-1111-1111-111111111111';
            process.env['TestConnection__credential'] = 'managedidentity';

            // Act & Assert
            expect(isUserBasedManagedIdentity('TestConnection')).to.be.false;
        });

        it('should return false when all are missing', () => {
            // Act & Assert
            expect(isUserBasedManagedIdentity('TestConnection')).to.be.false;
        });
    });
});
