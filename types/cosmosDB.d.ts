// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionInput, FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type CosmosDBHandler = (documents: unknown[], context: InvocationContext) => FunctionResult;

export interface CosmosDBFunctionOptions extends CosmosDBTriggerOptions, Partial<FunctionOptions> {
    handler: CosmosDBHandler;

    trigger?: CosmosDBTrigger;
}

export interface CosmosDBInputOptions {
    /**
     * An app setting (or environment variable) with the Cosmos DB connection string
     */
    connectionStringSetting: string;

    /**
     * The name of the Azure Cosmos DB database with the collection being monitored
     */
    databaseName: string;

    /**
     * The name of the collection being monitored
     */
    collectionName: string;

    /**
     * Specifies the partition key value for the lookup. May include binding parameters. It is required for lookups in partitioned collections
     */
    partitionKey?: string;

    /**
     * The ID of the document to retrieve. This property supports [binding expressions](https://docs.microsoft.com/azure/azure-functions/functions-bindings-expressions-patterns).
     * Don't set both the id and sqlQuery properties. If you don't set either one, the entire collection is retrieved.
     */
    id?: string;

    /**
     * An Azure Cosmos DB SQL query used for retrieving multiple documents. The property supports runtime bindings, as in this example:
     * `SELECT * FROM c where c.departmentId = {departmentId}`
     * Don't set both the id and sqlQuery properties. If you don't set either one, the entire collection is retrieved.
     */
    sqlQuery?: string;
}
export type CosmosDBInput = FunctionInput & CosmosDBInputOptions;

export interface CosmosDBTriggerOptions extends CosmosDBInputOptions {
    /**
     * The name of an app setting that contains the connection string to the service which holds the lease collection.
     * If not set it will connect to the service defined by `connectionStringSetting`
     */
    leaseConnectionStringSetting?: string;

    /**
     *  The name of the database that holds the collection to store leases. If not set, it will use the value of `databaseName`
     */
    leaseDatabaseName?: string;

    /**
     * The name of the collection to store leases. If not set, it will use "leases"
     */
    leaseCollectionName?: string;

    /**
     * Checks for existence and automatically creates the leases collection. Default is `false`
     */
    createLeaseCollectionIfNotExists?: boolean;

    /**
     * When `createLeaseCollectionIfNotExists` is set to `true`, defines the amount of Request Units to assign to the created lease collection
     */
    leaseCollectionThroughput?: number;

    /**
     * When set, the value is added as a prefix to the leases created in the Lease collection for this function.
     * Using a prefix allows two separate Azure Functions to share the same Lease collection by using different prefixes.
     */
    leaseCollectionPrefix?: string;
}
export type CosmosDBTrigger = FunctionTrigger & CosmosDBTriggerOptions;

export interface CosmosDBOutputOptions {
    /**
     * An app setting (or environment variable) with the Cosmos DB connection string
     */
    connectionStringSetting: string;

    /**
     * The name of the Azure Cosmos DB database with the collection being monitored
     */
    databaseName: string;

    /**
     * The name of the collection being monitored
     */
    collectionName: string;

    /**
     * A boolean value to indicate whether the collection is created when it doesn't exist.
     * The default is false because new collections are created with reserved throughput, which has cost implications. For more information, see the [pricing page](https://azure.microsoft.com/pricing/details/cosmos-db/).
     */
    createIfNotExists?: boolean;

    /**
     * When `createIfNotExists` is true, it defines the partition key path for the created collection. May include binding parameters.
     */
    partitionKey?: string;

    /**
     * When createIfNotExists is true, it defines the [throughput](https://docs.microsoft.com/azure/cosmos-db/set-throughput) of the created collection
     */
    collectionThroughput?: number;
}
export type CosmosDBOutput = FunctionOutput & CosmosDBOutputOptions;
