// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { McpContent } from '../src';
import { hasMcpContentMarker, shouldCreateStructuredContentMarker } from '../src/utils/mcpContentMarker';

describe('McpContent marker', () => {
    it('marks a class when called directly', () => {
        class DirectMarkedType {}

        McpContent(DirectMarkedType);

        expect(hasMcpContentMarker(DirectMarkedType)).to.equal(true);
        expect(hasMcpContentMarker(new DirectMarkedType())).to.equal(true);
        expect(shouldCreateStructuredContentMarker(new DirectMarkedType())).to.equal(true);
    });

    it('marks a class when called with no args (decorator factory form)', () => {
        class FactoryMarkedType {}

        const applyDecorator = McpContent();
        applyDecorator(FactoryMarkedType);

        expect(hasMcpContentMarker(FactoryMarkedType)).to.equal(true);
        expect(hasMcpContentMarker(new FactoryMarkedType())).to.equal(true);
        expect(shouldCreateStructuredContentMarker(new FactoryMarkedType())).to.equal(true);
    });

    it('does not mark unannotated values', () => {
        class UnmarkedType {}

        expect(hasMcpContentMarker(UnmarkedType)).to.equal(false);
        expect(hasMcpContentMarker(new UnmarkedType())).to.equal(false);
        expect(shouldCreateStructuredContentMarker(new UnmarkedType())).to.equal(false);
        expect(shouldCreateStructuredContentMarker({ foo: 'bar' })).to.equal(false);
        expect(shouldCreateStructuredContentMarker(['x'])).to.equal(false);
    });
});
