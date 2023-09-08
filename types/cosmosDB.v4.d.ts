// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionInput, FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger, RetryOptions } from './index';
import { InvocationContext } from './InvocationContext';

export type CosmosDBv4Handler = (documents: unknown[], context: InvocationContext) => FunctionResult;

export interface CosmosDBv4FunctionOptions extends CosmosDBv4TriggerOptions, Partial<FunctionOptions> {
    handler: CosmosDBv4Handler;

    trigger?: CosmosDBv4Trigger;

    /**
     * An optional retry policy to rerun a failed execution until either successful completion occurs or the maximum number of retries is reached.
     * Learn more [here](https://learn.microsoft.com/azure/azure-functions/functions-bindings-error-pages)
     */
    retry?: RetryOptions;
}

export interface CosmosDBv4InputOptions {
    /**
     * An app setting (or environment variable) with the Cosmos DB connection string
     */
    connection: string;

    /**
     * The name of the Azure Cosmos DB database with the container being monitored
     */
    databaseName: string;

    /**
     * The name of the container being monitored
     */
    containerName: string;

    /**
     * Specifies the partition key value for the lookup. May include binding parameters. It is required for lookups in partitioned containers
     */
    partitionKey?: string;

    /**
     * The ID of the document to retrieve. This property supports [binding expressions](https://docs.microsoft.com/azure/azure-functions/functions-bindings-expressions-patterns).
     * Don't set both the id and sqlQuery properties. If you don't set either one, the entire container is retrieved.
     */
    id?: string;

    /**
     * An Azure Cosmos DB SQL query used for retrieving multiple documents. The property supports runtime bindings, as in this example:
     * `SELECT * FROM c where c.departmentId = {departmentId}`
     * Don't set both the id and sqlQuery properties. If you don't set either one, the entire container is retrieved.
     */
    sqlQuery?: string;

    /**
     * Defines preferred locations (regions) for geo-replicated database accounts in the Azure Cosmos DB service.
     * Values should be comma-separated. For example, East US,South Central US,North Europe
     */
    preferredLocations?: string;
}
export type CosmosDBv4Input = FunctionInput & CosmosDBv4InputOptions;

export interface CosmosDBv4TriggerOptions {
    /**
     * An app setting (or environment variable) with the Cosmos DB connection string
     */
    connection: string;

    /**
     * The name of the Azure Cosmos DB database with the container being monitored
     */
    databaseName: string;

    /**
     * The name of the container being monitored
     */
    containerName: string;

    /**
     * The name of an app setting that contains the connection string to the service which holds the lease container.
     * If not set it will connect to the service defined by `connection`
     */
    leaseConnection?: string;

    /**
     *  The name of the database that holds the container to store leases. If not set, it will use the value of `databaseName`
     */
    leaseDatabaseName?: string;

    /**
     * The name of the container to store leases. If not set, it will use "leases"
     */
    leaseContainerName?: string;

    /**
     * Checks for existence and automatically creates the leases container. Default is `false`
     */
    createLeaseContainerIfNotExists?: boolean;

    /**
     * When `createLeaseContainerIfNotExists` is set to `true`, defines the amount of Request Units to assign to the created lease container
     */
    leasesContainerThroughput?: number;

    /**
     * When set, the value is added as a prefix to the leases created in the Lease container for this function.
     * Using a prefix allows two separate Azure Functions to share the same Lease container by using different prefixes.
     */
    leaseContainerPrefix?: string;

    /**
     * The time (in milliseconds) for the delay between polling a partition for new changes on the feed, after all current changes are drained.
     * Default is 5,000 milliseconds, or 5 seconds.
     */
    feedPollDelay?: number;

    /**
     * When set, it defines, in milliseconds, the interval to kick off a task to compute if partitions are distributed evenly among known host instances.
     * Default is 13000 (13 seconds).
     */
    leaseAcquireInterval?: number;

    /**
     * When set, it defines, in milliseconds, the interval for which the lease is taken on a lease representing a partition.
     * If the lease is not renewed within this interval, it will cause it to expire and ownership of the partition will move to another instance.
     * Default is 60000 (60 seconds).
     */
    leaseExpirationInterval?: number;

    /**
     * When set, it defines, in milliseconds, the renew interval for all leases for partitions currently held by an instance.
     * Default is 17000 (17 seconds).
     */
    leaseRenewInterval?: number;

    /**
     * When set, this property sets the maximum number of items received per Function call.
     * If operations in the monitored container are performed through stored procedures, transaction scope is preserved when reading items from the change feed.
     * As a result, the number of items received could be higher than the specified value so that the items changed by the same transaction are returned as part of one atomic batch.
     */
    maxItemsPerInvocation?: number;

    /**
     * This option tells the Trigger to read changes from the beginning of the container's change history instead of starting at the current time.
     * Reading from the beginning only works the first time the trigger starts, as in subsequent runs, the checkpoints are already stored.
     * Setting this option to true when there are leases already created has no effect.
     */
    startFromBeginning?: boolean;

    /**
     * Gets or sets the date and time from which to initialize the change feed read operation.
     * The recommended format is ISO 8601 with the UTC designator, such as 2021-02-16T14:19:29Z.
     * This is only used to set the initial trigger state. After the trigger has a lease state, changing this value has no effect.
     */
    startFromTime?: string;

    /**
     * Defines preferred locations (regions) for geo-replicated database accounts in the Azure Cosmos DB service.
     * Values should be comma-separated. For example, East US,South Central US,North Europe
     */
    preferredLocations?: string;
}
export type CosmosDBv4Trigger = FunctionTrigger & CosmosDBv4TriggerOptions;

export interface CosmosDBv4OutputOptions {
    /**
     * An app setting (or environment variable) with the Cosmos DB connection string
     */
    connection: string;

    /**
     * The name of the Azure Cosmos DB database with the collection being monitored
     */
    databaseName: string;

    /**
     * The name of the collection being monitored
     */
    containerName: string;

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
    containerThroughput?: number;

    /**
     * Defines preferred locations (regions) for geo-replicated database accounts in the Azure Cosmos DB service.
     * Values should be comma-separated. For example, East US,South Central US,North Europe
     */
    preferredLocations?: string;
}
export type CosmosDBv4Output = FunctionOutput & CosmosDBv4OutputOptions;
