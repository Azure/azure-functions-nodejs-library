// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { converToMcpToolTriggerOptionsToRpc } from '../../src/converters/toMcpToolTriggerOptionsToRpc';
import { toolProperty } from '../../src/utils/toolProperties';
import { McpToolProperty, McpToolTriggerOptions, ToolProps } from '../../types/mcpTool';

describe('converToMcpToolTriggerOptionsToRpc', () => {
    describe('basic conversion', () => {
        it('should throw error for minimal input without toolProperties', () => {
            const input: McpToolTriggerOptions = {
                toolName: 'simple-tool',
                description: 'A test tool',
            };

            expect(() => converToMcpToolTriggerOptionsToRpc(input)).to.throw(
                /Invalid toolProperties for tool 'simple-tool':/
            );
        });

        it('should handle empty properties array', () => {
            const input: McpToolTriggerOptions = {
                toolName: 'empty-props-tool',
                description: 'A tool with empty properties',
                toolProperties: [],
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolName).to.equal('empty-props-tool');
            expect(result.description).to.equal('A tool with empty properties');
            expect(result.toolProperties).to.equal('[]');
        });

        it('should throw error for undefined properties', () => {
            const input: McpToolTriggerOptions = {
                toolName: 'undefined-props-tool',
                description: 'A tool with undefined properties',
                toolProperties: undefined,
            };

            expect(() => converToMcpToolTriggerOptionsToRpc(input)).to.throw(
                /Invalid toolProperties for tool 'undefined-props-tool':/
            );
        });
    });

    describe('array format (legacy)', () => {
        it('should handle array format for properties', () => {
            const properties: McpToolProperty[] = [
                {
                    propertyName: 'testProp',
                    propertyType: 'string',
                    description: 'A test property',
                    isRequired: true,
                    isArray: false,
                },
                {
                    propertyName: 'arrayProp',
                    propertyType: 'number',
                    description: 'An array property',
                    isRequired: false,
                    isArray: true,
                },
            ];

            const input: McpToolTriggerOptions = {
                toolName: 'array-tool',
                description: 'A tool with array properties',
                toolProperties: properties,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolName).to.equal('array-tool');
            expect(result.description).to.equal('A tool with array properties');
            expect(result.toolProperties).to.be.a('string');

            // Test that it's valid JSON
            expect(() => JSON.parse(result.toolProperties || '')).to.not.throw();

            const parsedProperties = JSON.parse(result.toolProperties || '[]') as McpToolProperty[];
            expect(parsedProperties).to.be.an('array');
            expect(parsedProperties).to.have.length(2);
        });
    });

    describe('toolProps object format', () => {
        it('should handle toolProps object format', () => {
            const toolProperties: ToolProps = {
                name: toolProperty.string().describe('The name of the item'),
                age: toolProperty.number().describe('The age of the person').optional(),
            };

            const input: McpToolTriggerOptions = {
                toolName: 'fluent-tool',
                description: 'A tool with fluent properties',
                toolProperties: toolProperties,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolName).to.equal('fluent-tool');
            expect(result.description).to.equal('A tool with fluent properties');
            expect(result.toolProperties).to.be.a('string');

            // Test that it's valid JSON
            expect(() => JSON.parse(result.toolProperties || '')).to.not.throw();

            const parsedProperties = JSON.parse(result.toolProperties || '[]') as McpToolProperty[];
            expect(parsedProperties).to.be.an('array');
            expect(parsedProperties).to.have.length(2);
        });

        it('should handle all supported property types', () => {
            const toolProperties: ToolProps = {
                stringProp: toolProperty.string().describe('A string property'),
                numberProp: toolProperty.number().describe('A number property').optional(),
                booleanProp: toolProperty.boolean().describe('A boolean property'),
                objectProp: toolProperty.object().describe('An object property').optional(),
                doubleProp: toolProperty.double().describe('A double property'),
            };

            const input: McpToolTriggerOptions = {
                toolName: 'types-tool',
                description: 'A tool with different property types',
                toolProperties: toolProperties,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolProperties).to.be.a('string');
            expect(() => JSON.parse(result.toolProperties || '')).to.not.throw();

            const parsedProperties = JSON.parse(result.toolProperties || '[]') as McpToolProperty[];
            expect(parsedProperties).to.have.length(5);
        });

        it('should handle array properties correctly', () => {
            const toolProperties: ToolProps = {
                stringArray: toolProperty.string().describe('A string array').asArray().optional(),
                numberArray: toolProperty.number().describe('A number array').asArray(),
            };

            const input: McpToolTriggerOptions = {
                toolName: 'array-types-tool',
                description: 'A tool with array properties',
                toolProperties: toolProperties,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolProperties).to.be.a('string');
            expect(() => JSON.parse(result.toolProperties || '')).to.not.throw();

            const parsedProperties = JSON.parse(result.toolProperties || '[]') as McpToolProperty[];
            expect(parsedProperties).to.have.length(2);
        });
    });

    describe('error handling', () => {
        it('should throw error for invalid input', () => {
            const invalidInput = null as any;

            expect(() => converToMcpToolTriggerOptionsToRpc(invalidInput)).to.throw();
        });

        it('should throw error for undefined toolName', () => {
            const invalidInput = {
                description: 'A tool without name',
            } as any;

            expect(() => converToMcpToolTriggerOptionsToRpc(invalidInput)).to.throw(
                /Invalid toolProperties for tool 'undefined':/
            );
        });

        it('should throw error for empty toolName', () => {
            const invalidInput: McpToolTriggerOptions = {
                toolName: '',
                description: 'A tool with empty name',
            };

            expect(() => converToMcpToolTriggerOptionsToRpc(invalidInput)).to.throw(
                /Invalid toolProperties for tool '':/
            );
        });

        it('should throw error for null properties', () => {
            const input: McpToolTriggerOptions = {
                toolName: 'null-props-tool',
                description: 'A tool with null properties',
                toolProperties: null as any,
            };

            expect(() => converToMcpToolTriggerOptionsToRpc(input)).to.throw(
                /Invalid toolProperties for tool 'null-props-tool':/
            );
        });

        it('should throw error for invalid properties format', () => {
            const input: McpToolTriggerOptions = {
                toolName: 'invalid-props-tool',
                description: 'A tool with invalid properties',
                toolProperties: 'invalid string' as any,
            };

            expect(() => converToMcpToolTriggerOptionsToRpc(input)).to.throw(
                /Invalid toolProperties for tool 'invalid-props-tool':/
            );
        });

        it('should throw error for array properties with missing type', () => {
            const propertiesWithMissingType: McpToolProperty[] = [
                {
                    propertyName: 'testProp',
                    propertyType: '', // Missing type
                    description: 'A test property',
                    isRequired: true,
                    isArray: false,
                },
            ];

            const input: McpToolTriggerOptions = {
                toolName: 'missing-type-tool',
                description: 'A tool with missing type',
                toolProperties: propertiesWithMissingType,
            };

            expect(() => converToMcpToolTriggerOptionsToRpc(input)).to.throw(
                /Property type is required for property 'testProp'/
            );
        });

        it('should handle array properties with missing description by defaulting to empty string', () => {
            const propertiesWithMissingDescription: McpToolProperty[] = [
                {
                    propertyName: 'testProp',
                    propertyType: 'string',
                    description: '', // Missing description should default to empty string
                    isRequired: true,
                    isArray: false,
                },
            ];

            const input: McpToolTriggerOptions = {
                toolName: 'missing-description-tool',
                description: 'A tool with missing description',
                toolProperties: propertiesWithMissingDescription,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);
            expect(result).to.not.be.null;
            expect(result.toolProperties).to.be.a('string');

            const parsed = JSON.parse(result.toolProperties || '[]');
            expect(parsed).to.have.length(1);
            expect(parsed[0].description).to.equal('');
        });

        it('should throw error for array properties with both missing type and description', () => {
            const propertiesWithMissingFields: McpToolProperty[] = [
                {
                    propertyName: 'testProp',
                    propertyType: '', // Missing type
                    description: '', // Missing description
                    isRequired: true,
                    isArray: false,
                },
            ];

            const input: McpToolTriggerOptions = {
                toolName: 'missing-fields-tool',
                description: 'A tool with missing fields',
                toolProperties: propertiesWithMissingFields,
            };

            expect(() => converToMcpToolTriggerOptionsToRpc(input)).to.throw(
                /Property type is required for property 'testProp'/
            );
        });

        it('should handle fluent properties with missing description by defaulting to empty string', () => {
            // Create properties with object that lacks description but has other required properties
            const validToolProps = {
                validProp: {
                    propertyType: 'string',
                    description: '', // Empty description should default to empty string
                    isRequired: true,
                    isArray: false,
                } as any,
            };

            const input: McpToolTriggerOptions = {
                toolName: 'missing-desc-fluent-tool',
                description: 'A tool with missing description',
                toolProperties: validToolProps,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);
            expect(result).to.not.be.null;
            expect(result.toolProperties).to.be.a('string');

            const parsed = JSON.parse(result.toolProperties || '[]');
            expect(parsed).to.have.length(1);
            expect(parsed[0].description).to.equal('');
        });
    });

    describe('JSON serialization', () => {
        it('should produce valid JSON in toolProperties', () => {
            const toolProperties: ToolProps = {
                test: toolProperty.string().describe('Test property'),
            };

            const input: McpToolTriggerOptions = {
                toolName: 'json-test-tool',
                description: 'A tool for JSON testing',
                toolProperties: toolProperties,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolProperties).to.be.a('string');
            expect(() => JSON.parse(result.toolProperties || '')).to.not.throw();

            const parsed = JSON.parse(result.toolProperties || '[]');
            expect(parsed).to.be.an('array');
            expect(parsed).to.have.length(1);
        });

        it('should handle empty array serialization', () => {
            const input: McpToolTriggerOptions = {
                toolName: 'empty-array-tool',
                description: 'A tool with empty array',
                toolProperties: [],
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolProperties).to.equal('[]');
            expect(() => JSON.parse(result.toolProperties || '')).to.not.throw();

            const parsed = JSON.parse(result.toolProperties || '[]');
            expect(parsed).to.be.an('array');
            expect(parsed).to.have.length(0);
        });
    });

    describe('edge cases', () => {
        it('should handle properties with special characters', () => {
            const toolProperties: ToolProps = {
                'special-field_with$symbols': toolProperty
                    .string()
                    .describe('A property with special characters in name'),
            };

            const input: McpToolTriggerOptions = {
                toolName: 'special-tool',
                description: 'A tool with special character properties',
                toolProperties: toolProperties,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolProperties).to.be.a('string');
            expect(() => JSON.parse(result.toolProperties || '')).to.not.throw();

            const parsedProperties = JSON.parse(result.toolProperties || '[]') as McpToolProperty[];
            expect(parsedProperties).to.have.length(1);
        });

        it('should handle properties with non-empty descriptions', () => {
            const toolProperties: ToolProps = {
                validDesc: toolProperty.string().describe('A valid description'),
            };

            const input: McpToolTriggerOptions = {
                toolName: 'valid-desc-tool',
                description: 'A tool with valid description property',
                toolProperties: toolProperties,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolProperties).to.be.a('string');
            expect(() => JSON.parse(result.toolProperties || '')).to.not.throw();

            const parsedProperties = JSON.parse(result.toolProperties || '[]') as McpToolProperty[];
            expect(parsedProperties).to.have.length(1);
        });
        it('should handle whitespace in names and descriptions', () => {
            const toolProperties: ToolProps = {
                '  spaced name  ': toolProperty.string().describe('  spaced description  ').optional(),
            };

            const input: McpToolTriggerOptions = {
                toolName: '  spaced tool  ',
                description: '  spaced tool description  ',
                toolProperties: toolProperties,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolName).to.equal('  spaced tool  ');
            expect(result.description).to.equal('  spaced tool description  ');

            expect(result.toolProperties).to.be.a('string');
            expect(() => JSON.parse(result.toolProperties || '')).to.not.throw();
        });
    });
});
