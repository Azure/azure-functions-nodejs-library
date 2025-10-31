// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import {
    convertToolProperties,
    normalizeToolProperties,
    toolProperty,
    ToolPropertyBuilder,
} from '../src/utils/toolProperties';

describe('isArray property support', () => {
    it('asArray() method sets isArray to true', () => {
        const stringArrayProp = toolProperty.string().asArray().describe('String array');
        expect(stringArrayProp.isArray).to.equal(true);
        expect(stringArrayProp.propertyType).to.equal('string');
        expect(stringArrayProp.description).to.equal('String array');
        expect(stringArrayProp.isRequired).to.equal(true);
    });

    it('regular properties have isArray set to false', () => {
        const regularProp = toolProperty.string().describe('Regular string').optional();
        expect(regularProp.isArray).to.equal(false);
        expect(regularProp.propertyType).to.equal('string');
        expect(regularProp.description).to.equal('Regular string');
        expect(regularProp.isRequired).to.equal(false);
    });

    it('convertToolProperties preserves isArray property', () => {
        const toolProps = {
            stringArray: toolProperty.string().asArray().describe('String array'),
            numberArray: toolProperty.number().asArray().describe('Number array').optional(),
            regularProp: toolProperty.boolean().describe('Regular boolean'),
        };

        const converted = convertToolProperties(toolProps);

        expect(converted).to.have.lengthOf(3);

        const stringArrayProp = converted.find((p) => p.propertyName === 'stringArray');
        expect(stringArrayProp?.isArray).to.equal(true);
        expect(stringArrayProp?.propertyType).to.equal('string');

        const numberArrayProp = converted.find((p) => p.propertyName === 'numberArray');
        expect(numberArrayProp?.isArray).to.equal(true);
        expect(numberArrayProp?.propertyType).to.equal('number');

        const regularBooleanProp = converted.find((p) => p.propertyName === 'regularProp');
        expect(regularBooleanProp?.isArray).to.equal(false);
        expect(regularBooleanProp?.propertyType).to.equal('boolean');
    });

    it('normalizeToolProperties handles legacy format with isArray', () => {
        const legacyProps = [
            {
                propertyName: 'categories',
                propertyType: 'string',
                description: 'Categories',
                isRequired: false,
                isArray: true,
            },
            {
                propertyName: 'count',
                propertyType: 'number',
                description: 'Count',
                isRequired: true,
                isArray: false,
            },
        ];

        const normalized = normalizeToolProperties(legacyProps);
        expect(normalized).to.deep.equal(legacyProps);
        expect(normalized).to.not.be.undefined;
        if (normalized) {
            expect(normalized[0]?.isArray).to.equal(true);
            expect(normalized[1]?.isArray).to.equal(false);
        }
    });

    it('all property types support asArray()', () => {
        const stringArray = toolProperty.string().asArray().describe('String array');
        const numberArray = toolProperty.number().asArray().describe('Number array');
        const booleanArray = toolProperty.boolean().asArray().describe('Boolean array');
        const objectArray = toolProperty.object().asArray().describe('Object array');
        const longArray = toolProperty.long().asArray().describe('Long array');

        expect(stringArray.isArray).to.equal(true);
        expect(numberArray.isArray).to.equal(true);
        expect(booleanArray.isArray).to.equal(true);
        expect(objectArray.isArray).to.equal(true);
        expect(longArray.isArray).to.equal(true);
    });

    it('supports seamless property access after desc()', () => {
        // Test the specific pattern from user's example - this should work seamlessly
        const toolProperties = {
            name: toolProperty.string().describe('Required property to identify the caller.').optional(),
            arrayT: toolProperty.string().asArray().describe('An array of strings property.'),
        };

        expect(toolProperties.name).to.have.property('propertyType', 'string');
        expect(toolProperties.name).to.have.property('isRequired', false);

        expect(toolProperties.arrayT.propertyType).to.equal('string');
        expect(toolProperties.arrayT.isArray).to.equal(true);
        expect(toolProperties.arrayT.description).to.equal('An array of strings property.');
        expect(toolProperties.arrayT.isRequired).to.equal(true); // explicitly required
    });

    it('property access validates required fields and defaults description', () => {
        expect(() => {
            // Missing propertyType should throw when propertyType getter is accessed
            const builder = new ToolPropertyBuilder();
            builder.describe('Some description');
            return builder.propertyType; // This should throw
        }).to.throw('Property type must be specified');

        // Missing description should default to empty string when description getter is accessed
        const builder = toolProperty.string();
        expect(builder.description).to.equal(''); // Should default to empty string
    });
});
