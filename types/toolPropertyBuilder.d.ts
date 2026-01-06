// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import type { Arg } from './mcpTool';

/**
 * Interface for the fluent API builder for creating MCP Tool properties
 * This acts as a bridge between the implementation and type declarations
 */
export interface IToolPropertyBuilder extends Omit<Arg, never> {
    readonly propertyType: string;
    readonly description: string;
    readonly isRequired: boolean;
    readonly isArray: boolean;

    /**
     * Set the property type to string
     */
    string(): IToolPropertyBuilder;

    /**
     * Set the property type to double
     */
    double(): IToolPropertyBuilder;

    /**
     * Set the property type to long
     */
    long(): IToolPropertyBuilder;

    /**
     * Set the property type to number
     */
    number(): IToolPropertyBuilder;

    /**
     * Set the property type to boolean
     */
    boolean(): IToolPropertyBuilder;

    /**
     * Set the property type to object
     */
    object(): IToolPropertyBuilder;

    /**
     * Set the property type to integer
     */
    integer(): IToolPropertyBuilder;

    /**
     * Set the property type to datetime
     */
    datetime(): IToolPropertyBuilder;

    /**
     * Set the description for the property
     * @param description - Description of the property's purpose
     */
    describe(description: string): IToolPropertyBuilder;

    /**
     * Mark the property as optional
     */
    optional(): IToolPropertyBuilder;

    /**
     * Mark the property as an array type
     */
    asArray(): IToolPropertyBuilder;
}
