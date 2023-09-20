// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionInput, FunctionOutput } from './index';

export interface TableOutputOptions {
    /**
     * The table name
     */
    tableName: string;

    /**
     * An app setting (or environment variable) with the storage connection string to be used by this table output
     */
    connection: string;

    /**
     * The partition key of the table entity to write.
     */
    partitionKey?: string;

    /**
     * The row key of the table entity to write.
     */
    rowKey?: string;
}
export type TableOutput = FunctionOutput & TableOutputOptions;

export interface TableInputOptions {
    /**
     * The table name
     */
    tableName: string;

    /**
     * An app setting (or environment variable) with the storage connection string to be used by this table input
     */
    connection: string;

    /**
     * The partition key of the table entity to read.
     */
    partitionKey?: string;

    /**
     * The row key of the table entity to read. Can't be used with `take` or `filter`.
     */
    rowKey?: string;

    /**
     * The maximum number of entities to return. Can't be used with `rowKey`
     */
    take?: number;

    /**
     * An OData filter expression for the entities to return from the table. Can't be used with `rowKey`.
     */
    filter?: string;
}
export type TableInput = FunctionInput & TableInputOptions;
