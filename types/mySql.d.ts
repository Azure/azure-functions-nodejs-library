// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionInput, FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type MySqlHandler = (changes: MySqlChange[], context: InvocationContext) => FunctionResult;

export interface MySqlFunctionOptions extends MySqlTriggerOptions, Partial<FunctionOptions> {
    handler: MySqlHandler;

    trigger?: MySqlTrigger;
}

export interface MySqlTriggerOptions {
    /**
     * The name of the table monitored by the trigger.
     */
    tableName: string;

    /**
     * An app setting (or environment variable) with the connection string for the database containing the table monitored for changes
     */
    connectionStringSetting: string;
}
export type MySqlTrigger = FunctionTrigger & MySqlTriggerOptions;

export interface MySqlChange {
    Item: unknown;
    Operation: MySqlChangeOperation;
}

export enum MySqlChangeOperation {
    Update = 0,
}

export interface MySqlInputOptions {
    /**
     * The Transact-SQL query command or name of the stored procedure executed by the binding.
     */
    commandText: string;

    /**
     * The command type value
     */
    commandType: 'Text' | 'StoredProcedure';

    /**
     * An app setting (or environment variable) with the connection string for the database against which the query or stored procedure is being executed
     */
    connectionStringSetting: string;

    /**
     * Zero or more parameter values passed to the command during execution as a single string.
     * Must follow the format @param1=param1,@param2=param2.
     * Neither the parameter name nor the parameter value can contain a comma (,) or an equals sign (=).
     */
    parameters?: string;
}
export type MySqlInput = FunctionInput & MySqlInputOptions;

export interface MySqlOutputOptions {
    /**
     * The name of the table being written to by the binding.
     */
    commandText: string;

    /**
     * An app setting (or environment variable) with the connection string for the database to which data is being written
     */
    connectionStringSetting: string;
}
export type MySqlOutput = FunctionOutput & MySqlOutputOptions;
