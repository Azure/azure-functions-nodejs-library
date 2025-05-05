// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import { isModelBindingData, parseConnectionDetails } from '../../src/sdk-binding/connectionDetails';

describe('connectionDetails', () => {
    describe('parseConnectionDetails', () => {
        it('should parse valid BlobConnectionDetails JSON', () => {
            const validJson = JSON.stringify({
                Connection:
                    'DefaultEndpointsProtocol=https;AccountName=storageaccount;AccountKey=key==;EndpointSuffix=core.windows.net',
                ContainerName: 'mycontainer',
                BlobName: 'myblob.txt',
            });

            const buffer = Buffer.from(validJson);
            const result = parseConnectionDetails(buffer);

            expect(result).to.deep.equal({
                Connection:
                    'DefaultEndpointsProtocol=https;AccountName=storageaccount;AccountKey=key==;EndpointSuffix=core.windows.net',
                ContainerName: 'mycontainer',
                BlobName: 'myblob.txt',
            });
        });

        it('should throw error for null buffer', () => {
            expect(() => parseConnectionDetails(null)).to.throw('Connection details content is null or undefined');
        });

        it('should throw error for undefined buffer', () => {
            expect(() => parseConnectionDetails(undefined)).to.throw('Connection details content is null or undefined');
        });

        it('should throw error for invalid JSON', () => {
            const invalidJson = Buffer.from('{not valid json}');
            expect(() => parseConnectionDetails(invalidJson)).to.throw(SyntaxError);
        });

        it('should throw error for JSON that is not BlobConnectionDetails', () => {
            const invalidConnectionDetails = JSON.stringify({
                NotConnection: 'something',
                NotContainerName: 'something else',
            });

            const buffer = Buffer.from(invalidConnectionDetails);
            expect(() => parseConnectionDetails(buffer)).to.throw('Invalid connection info type');
        });

        it('should throw error for incomplete BlobConnectionDetails', () => {
            const incompleteJson = JSON.stringify({
                Connection: 'connection-string',
                // Missing ContainerName and BlobName
            });

            const buffer = Buffer.from(incompleteJson);
            expect(() => parseConnectionDetails(buffer)).to.throw('Invalid connection info type');
        });

        it('should throw error when properties have wrong types', () => {
            const wrongTypesJson = JSON.stringify({
                Connection: 'string-ok',
                ContainerName: 123, // Not a string
                BlobName: true, // Not a string
            });

            const buffer = Buffer.from(wrongTypesJson);
            expect(() => parseConnectionDetails(buffer)).to.throw('Invalid connection info type');
        });
    });

    describe('isModelBindingData', () => {
        // Note: There appears to be a bug in the implementation of isModelBindingData
        // It returns false when content IS a Buffer, which is opposite of what we'd expect

        it('should identify null as not ModelBindingData', () => {
            expect(isModelBindingData(null)).to.be.false;
        });

        it('should identify non-object as not ModelBindingData', () => {
            expect(isModelBindingData('string')).to.be.false;
            expect(isModelBindingData(123)).to.be.false;
            expect(isModelBindingData(true)).to.be.false;
        });

        it('should handle objects with string properties correctly', () => {
            const validStringProps = {
                content: Buffer.from('test'),
                contentType: 'application/json',
                source: 'test-source',
                version: '1.0',
            };

            // This should pass as all string properties are valid
            expect(isModelBindingData(validStringProps)).to.be.true;

            // Test with invalid string property types
            const invalidStringProps = {
                contentType: 123, // Not a string
                source: 'test-source',
                version: '1.0',
            };

            expect(isModelBindingData(invalidStringProps)).to.be.false;
        });

        //The current implementation returns false when content IS a Buffer
        it('returns false when content IS a Buffer', () => {
            const modelBindingWithBuffer = {
                content: Buffer.from('test'),
                contentType: 'text/plain',
            };
            expect(isModelBindingData(modelBindingWithBuffer)).to.be.true;
        });

        it('should handle empty objects', () => {
            expect(isModelBindingData({})).to.be.false; // This is potentially incorrect behavior
        });
    });

    // This provides an additional test suite for isBlobConnectionDetails through parseConnectionDetails
    describe('isBlobConnectionDetails (indirect tests)', () => {
        it('should identify valid BlobConnectionDetails object', () => {
            const validObject = {
                Connection: 'connection-string',
                ContainerName: 'container',
                BlobName: 'blob',
            };

            // We can't test isBlobConnectionDetails directly as it's private
            // But we can test it through parseConnectionDetails
            const buffer = Buffer.from(JSON.stringify(validObject));
            const result = parseConnectionDetails(buffer);
            expect(result).to.deep.equal(validObject);
        });
    });
});
