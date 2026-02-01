// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { convertToMcpResourceTriggerOptionsToRpc } from '../../src/converters/toMcpResourceTriggerOptionsToRpc';
import { McpResourceTriggerOptions } from '../../types/mcpResource';

describe('convertToMcpResourceTriggerOptionsToRpc', () => {
    describe('required properties validation', () => {
        it('should throw error when uri is missing', () => {
            const input = {
                resourceName: 'My Resource',
            } as McpResourceTriggerOptions;

            expect(() => convertToMcpResourceTriggerOptionsToRpc(input)).to.throw(
                'MCP Resource trigger requires a valid "uri" property.'
            );
        });

        it('should throw error when uri is empty string', () => {
            const input: McpResourceTriggerOptions = {
                uri: '',
                resourceName: 'My Resource',
            };

            expect(() => convertToMcpResourceTriggerOptionsToRpc(input)).to.throw(
                'MCP Resource trigger requires a valid "uri" property.'
            );
        });

        it('should throw error when uri is whitespace only', () => {
            const input: McpResourceTriggerOptions = {
                uri: '   ',
                resourceName: 'My Resource',
            };

            expect(() => convertToMcpResourceTriggerOptionsToRpc(input)).to.throw(
                'MCP Resource trigger requires a valid "uri" property.'
            );
        });

        it('should throw error when resourceName is missing', () => {
            const input = {
                uri: 'mcp://example.com/resource',
            } as McpResourceTriggerOptions;

            expect(() => convertToMcpResourceTriggerOptionsToRpc(input)).to.throw(
                'MCP Resource trigger requires a valid "resourceName" property.'
            );
        });

        it('should throw error when resourceName is empty string', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: '',
            };

            expect(() => convertToMcpResourceTriggerOptionsToRpc(input)).to.throw(
                'MCP Resource trigger requires a valid "resourceName" property.'
            );
        });

        it('should throw error when resourceName is whitespace only', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: '   ',
            };

            expect(() => convertToMcpResourceTriggerOptionsToRpc(input)).to.throw(
                'MCP Resource trigger requires a valid "resourceName" property.'
            );
        });
    });

    describe('minimal valid input', () => {
        it('should convert with only required properties', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.uri).to.equal('mcp://example.com/resource');
            expect(result.resourceName).to.equal('My Resource');
            expect(result.title).to.be.undefined;
            expect(result.description).to.be.undefined;
            expect(result.mimeType).to.be.undefined;
            expect(result.size).to.be.undefined;
            expect(result.metadata).to.be.undefined;
        });
    });

    describe('optional properties', () => {
        it('should include title when provided', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
                title: 'Resource Title',
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.title).to.equal('Resource Title');
        });

        it('should include description when provided', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
                description: 'This is a description of the resource.',
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.description).to.equal('This is a description of the resource.');
        });

        it('should include mimeType when provided', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
                mimeType: 'application/json',
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.mimeType).to.equal('application/json');
        });

        it('should include size when provided', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
                size: 1024,
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.size).to.equal(1024);
        });

        it('should include metadata when provided', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
                metadata: '{"key": "value"}',
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.metadata).to.equal('{"key": "value"}');
        });

        it('should handle all optional properties together', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource/123',
                resourceName: 'Complete Resource',
                title: 'Complete Resource Title',
                description: 'A complete resource with all properties.',
                mimeType: 'text/plain',
                size: 2048,
                metadata: '{"version": "1.0", "author": "test"}',
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.uri).to.equal('mcp://example.com/resource/123');
            expect(result.resourceName).to.equal('Complete Resource');
            expect(result.title).to.equal('Complete Resource Title');
            expect(result.description).to.equal('A complete resource with all properties.');
            expect(result.mimeType).to.equal('text/plain');
            expect(result.size).to.equal(2048);
            expect(result.metadata).to.equal('{"version": "1.0", "author": "test"}');
        });
    });

    describe('size validation', () => {
        it('should accept size of 0', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
                size: 0,
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.size).to.equal(0);
        });

        it('should throw error for negative size', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
                size: -1,
            };

            expect(() => convertToMcpResourceTriggerOptionsToRpc(input)).to.throw(
                'MCP Resource trigger "size" must be a non-negative number.'
            );
        });

        it('should accept large size values', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
                size: Number.MAX_SAFE_INTEGER,
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.size).to.equal(Number.MAX_SAFE_INTEGER);
        });
    });

    describe('edge cases', () => {
        it('should handle URIs with special characters', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource?query=value&other=123',
                resourceName: 'Resource with Query',
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.uri).to.equal('mcp://example.com/resource?query=value&other=123');
        });

        it('should handle resourceName with special characters', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'Resource (Test) - v1.0',
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.resourceName).to.equal('Resource (Test) - v1.0');
        });

        it('should handle empty string for optional properties', () => {
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
                title: '',
                description: '',
                mimeType: '',
                metadata: '',
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.title).to.equal('');
            expect(result.description).to.equal('');
            expect(result.mimeType).to.equal('');
            expect(result.metadata).to.equal('');
        });

        it('should handle complex metadata JSON', () => {
            const metadataObj = {
                version: '2.0',
                tags: ['tag1', 'tag2', 'tag3'],
                nested: {
                    key: 'value',
                    number: 42,
                },
            };
            const input: McpResourceTriggerOptions = {
                uri: 'mcp://example.com/resource',
                resourceName: 'My Resource',
                metadata: JSON.stringify(metadataObj),
            };

            const result = convertToMcpResourceTriggerOptionsToRpc(input);

            expect(result.metadata).to.equal(JSON.stringify(metadataObj));
            // Verify it can be parsed back
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(JSON.parse(result.metadata!)).to.deep.equal(metadataObj);
        });
    });
});
