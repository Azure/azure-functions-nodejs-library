// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    CosmosDBv3FunctionOptions,
    CosmosDBv3Handler,
    CosmosDBv3Input,
    CosmosDBv3InputOptions,
    CosmosDBv3Output,
    CosmosDBv3OutputOptions,
    CosmosDBv3Trigger,
    CosmosDBv3TriggerOptions,
} from './cosmosDB.v3';
import {
    CosmosDBv4FunctionOptions,
    CosmosDBv4Handler,
    CosmosDBv4Input,
    CosmosDBv4InputOptions,
    CosmosDBv4Output,
    CosmosDBv4OutputOptions,
    CosmosDBv4Trigger,
    CosmosDBv4TriggerOptions,
} from './cosmosDB.v4';

export type CosmosDBHandler = CosmosDBv3Handler | CosmosDBv4Handler;

export type CosmosDBFunctionOptions = CosmosDBv3FunctionOptions | CosmosDBv4FunctionOptions;

export type CosmosDBInputOptions = CosmosDBv3InputOptions | CosmosDBv4InputOptions;
export type CosmosDBInput = CosmosDBv3Input | CosmosDBv4Input;

export type CosmosDBTriggerOptions = CosmosDBv3TriggerOptions | CosmosDBv4TriggerOptions;
export type CosmosDBTrigger = CosmosDBv3Trigger | CosmosDBv4Trigger;

export type CosmosDBOutputOptions = CosmosDBv3OutputOptions | CosmosDBv4OutputOptions;
export type CosmosDBOutput = CosmosDBv3Output | CosmosDBv4Output;
