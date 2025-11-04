// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { converToMcpToolTriggerOptionsToRpc } from '../../src/converters/toMcpToolTriggerOptionsToRpc';
import { arg } from '../../src/utils/toolProperties';
import type { Args } from '../../types/mcpTool';
import { McpToolProperty, McpToolTriggerOptions } from '../../types/mcpTool';

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
            const toolProperties: Args = {
                name: arg.string().describe('The name of the item'),
                age: arg.number().describe('The age of the person').optional(),
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
            const toolProperties: Args = {
                stringProp: arg.string().describe('A string property'),
                numberProp: arg.number().describe('A number property').optional(),
                booleanProp: arg.boolean().describe('A boolean property'),
                objectProp: arg.object().describe('An object property').optional(),
                integerProp: arg.integer().describe('An integer property'),
                longProp: arg.long().describe('A long property'),
                doubleProp: arg.double().describe('A double property').optional(),
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
            expect(parsedProperties).to.have.length(7);

            // Verify long and double properties are correctly converted
            const longProp = parsedProperties.find((p) => p.propertyName === 'longProp');
            expect(longProp?.propertyType).to.equal('number');
            expect(longProp?.description).to.equal('A long property');
            expect(longProp?.isRequired).to.equal(true);

            const doubleProp = parsedProperties.find((p) => p.propertyName === 'doubleProp');
            expect(doubleProp?.propertyType).to.equal('number');
            expect(doubleProp?.description).to.equal('A double property');
            expect(doubleProp?.isRequired).to.equal(false);
        });

        it('should handle array properties correctly', () => {
            const toolProperties: Args = {
                stringArray: arg.string().describe('A string array').asArray().optional(),
                numberArray: arg.number().describe('A number array').asArray(),
                longArray: arg.long().describe('A long array').asArray(),
                doubleArray: arg.double().describe('A double array').asArray().optional(),
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
            expect(parsedProperties).to.have.length(4);

            // Verify long and double array properties
            const longArray = parsedProperties.find((p) => p.propertyName === 'longArray');
            expect(longArray?.propertyType).to.equal('number');
            expect(longArray?.isArray).to.equal(true);
            expect(longArray?.isRequired).to.equal(true);

            const doubleArray = parsedProperties.find((p) => p.propertyName === 'doubleArray');
            expect(doubleArray?.propertyType).to.equal('number');
            expect(doubleArray?.isArray).to.equal(true);
            expect(doubleArray?.isRequired).to.equal(false);
        });

        it('should handle long and double property types specifically', () => {
            const toolProperties: Args = {
                longValue: arg.long().describe('A long integer value'),
                doubleValue: arg.double().describe('A double precision value').optional(),
                longArrayValue: arg.long().asArray().describe('Array of long values'),
                doubleArrayValue: arg.double().asArray().describe('Array of double values').optional(),
            };

            const input: McpToolTriggerOptions = {
                toolName: 'long-double-tool',
                description: 'A tool testing long and double types',
                toolProperties: toolProperties,
            };

            const result = converToMcpToolTriggerOptionsToRpc(input);

            expect(result.toolProperties).to.be.a('string');
            expect(() => JSON.parse(result.toolProperties || '')).to.not.throw();

            const parsedProperties = JSON.parse(result.toolProperties || '[]') as McpToolProperty[];
            expect(parsedProperties).to.have.length(4);

            // Test individual long property
            const longProp = parsedProperties.find((p) => p.propertyName === 'longValue');
            expect(longProp).to.not.be.undefined;
            expect(longProp?.propertyType).to.equal('number');
            expect(longProp?.description).to.equal('A long integer value');
            expect(longProp?.isRequired).to.equal(true);
            expect(longProp?.isArray).to.equal(false);

            // Test individual double property
            const doubleProp = parsedProperties.find((p) => p.propertyName === 'doubleValue');
            expect(doubleProp).to.not.be.undefined;
            expect(doubleProp?.propertyType).to.equal('number');
            expect(doubleProp?.description).to.equal('A double precision value');
            expect(doubleProp?.isRequired).to.equal(false);
            expect(doubleProp?.isArray).to.equal(false);

            // Test long array property
            const longArrayProp = parsedProperties.find((p) => p.propertyName === 'longArrayValue');
            expect(longArrayProp).to.not.be.undefined;
            expect(longArrayProp?.propertyType).to.equal('number');
            expect(longArrayProp?.isArray).to.equal(true);
            expect(longArrayProp?.isRequired).to.equal(true);

            // Test double array property
            const doubleArrayProp = parsedProperties.find((p) => p.propertyName === 'doubleArrayValue');
            expect(doubleArrayProp).to.not.be.undefined;
            expect(doubleArrayProp?.propertyType).to.equal('number');
            expect(doubleArrayProp?.isArray).to.equal(true);
            expect(doubleArrayProp?.isRequired).to.equal(false);
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
            const toolProperties: Args = {
                test: arg.string().describe('Test property'),
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
            const toolProperties: Args = {
                'special-field_with$symbols': arg.string().describe('A property with special characters in name'),
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
            const toolProperties: Args = {
                validDesc: arg.string().describe('A valid description'),
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
            const toolProperties: Args = {
                '  spaced name  ': arg.string().describe('  spaced description  ').optional(),
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
