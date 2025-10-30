// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import {
    convertToolProperties,
    normalizeToolProperties,
    toolProp,
    ToolPropertyBuilder,
} from '../src/utils/toolProperties';

describe('isArray property support', () => {
    it('asArray() method sets isArray to true', () => {
        const stringArrayProp = toolProp.string().asArray().desc('String array');
        expect(stringArrayProp.isArray).to.equal(true);
        expect(stringArrayProp.propertyType).to.equal('string');
        expect(stringArrayProp.description).to.equal('String array');
        expect(stringArrayProp.isRequired).to.equal(true);
    });

    it('regular properties have isArray set to false', () => {
        const regularProp = toolProp.string().desc('Regular string').optional();
        expect(regularProp.isArray).to.equal(false);
        expect(regularProp.propertyType).to.equal('string');
        expect(regularProp.description).to.equal('Regular string');
        expect(regularProp.isRequired).to.equal(false);
    });

    it('convertToolProperties preserves isArray property', () => {
        const toolProps = {
            stringArray: toolProp.string().asArray().desc('String array'),
            numberArray: toolProp.number().asArray().desc('Number array').optional(),
            regularProp: toolProp.boolean().desc('Regular boolean'),
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
        const stringArray = toolProp.string().asArray().desc('String array');
        const numberArray = toolProp.number().asArray().desc('Number array');
        const booleanArray = toolProp.boolean().asArray().desc('Boolean array');
        const objectArray = toolProp.object().asArray().desc('Object array');
        const longArray = toolProp.long().asArray().desc('Long array');

        expect(stringArray.isArray).to.equal(true);
        expect(numberArray.isArray).to.equal(true);
        expect(booleanArray.isArray).to.equal(true);
        expect(objectArray.isArray).to.equal(true);
        expect(longArray.isArray).to.equal(true);
    });

    it('supports seamless property access after desc()', () => {
        // Test the specific pattern from user's example - this should work seamlessly
        const toolProperties = {
            name: toolProp.string().desc('Required property to identify the caller.').optional(),
            arrayT: toolProp.string().asArray().desc('An array of strings property.'),
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
            builder.desc('Some description');
            return builder.propertyType; // This should throw
        }).to.throw('Property type must be specified');

        // Missing description should default to empty string when description getter is accessed
        const builder = toolProp.string();
        expect(builder.description).to.equal(''); // Should default to empty string
    });
});
