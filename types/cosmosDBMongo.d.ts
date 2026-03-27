// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionInput, FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger, RetryOptions } from './index';
import { InvocationContext } from './InvocationContext';

/**
 * Handler type for CosmosDB Mongo trigger functions.
 * The trigger delivers the change stream document serialized as JSON.
 */
export type CosmosDBMongoHandler<T = unknown> = (documents: T, context: InvocationContext) => FunctionResult;

/**
 * Options for registering a CosmosDB Mongo-triggered function via `app.cosmosDBMongo()`.
 */
export interface CosmosDBMongoFunctionOptions<T = unknown> extends CosmosDBMongoTriggerOptions, Partial<FunctionOptions> {
    handler: CosmosDBMongoHandler<T>;

    trigger?: CosmosDBMongoTrigger;

    /**
     * An optional retry policy to rerun a failed execution until either successful completion occurs
     * or the maximum number of retries is reached.
     * Learn more [here](https://learn.microsoft.com/azure/azure-functions/functions-bindings-error-pages)
     */
    retry?: RetryOptions;
}

/**
 * Options for configuring a CosmosDB Mongo trigger binding.
 */
export interface CosmosDBMongoTriggerOptions {
    /**
     * An app setting (or environment variable) with the MongoDB connection string.
     * Defaults to "CosmosDBMongo" if not specified.
     */
    connectionStringSetting: string;

    /**
     * The name of the database being monitored.
     */
    databaseName: string;

    /**
     * The name of the collection being monitored.
     * Optional when triggerLevel is "Database" or "Cluster".
     */
    collectionName?: string;

    /**
     * Whether to create the collection and lease collection if they do not exist.
     * Default is false.
     */
    createIfNotExists?: boolean;

    /**
     * The level at which the trigger monitors for changes.
     * Accepted values: "Collection" | "Database" | "Cluster".
     * Default is "Collection".
     */
    triggerLevel?: 'Collection' | 'Database' | 'Cluster';

    /**
     * The name of the database that holds the lease collection.
     * Defaults to the monitored database name.
     */
    leaseDatabaseName?: string;

    /**
     * The name of the collection used to store leases.
     * Defaults to "leases".
     */
    leaseCollectionName?: string;

    /**
     * An app setting name for the connection string of the lease account.
     * If not set, uses the monitored account connection string.
     */
    leaseConnectionStringSetting?: string;

    /**
     * The Azure AD tenant ID used for managed identity authentication on the monitored account.
     */
    tenantId?: string;

    /**
     * The managed identity client ID for the monitored account.
     * Used for user-assigned managed identity authentication.
     */
    managedIdentityClientId?: string;

    /**
     * The Azure AD tenant ID used for managed identity authentication on the lease account.
     */
    leaseTenantId?: string;

    /**
     * The managed identity client ID for the lease account.
     */
    leaseManagedIdentityClientId?: string;
}

export type CosmosDBMongoTrigger = FunctionTrigger & CosmosDBMongoTriggerOptions;

/**
 * Options for configuring a CosmosDB Mongo input binding.
 */
export interface CosmosDBMongoInputOptions {
    /**
     * An app setting (or environment variable) with the MongoDB connection string.
     * Defaults to "CosmosDBMongo" if not specified.
     */
    connectionStringSetting: string;

    /**
     * The name of the database to read from.
     */
    databaseName: string;

    /**
     * The name of the collection to read from.
     */
    collectionName: string;

    /**
     * An optional MongoDB filter document as a JSON string.
     * Supports binding expressions, e.g. {"id": "{Query.id}"}.
     */
    queryString?: string;

    /**
     * Whether to create the collection if it does not exist.
     * Default is false.
     */
    createIfNotExists?: boolean;

    /**
     * The Azure AD tenant ID used for managed identity authentication.
     */
    tenantId?: string;

    /**
     * The managed identity client ID for user-assigned managed identity authentication.
     */
    managedIdentityClientId?: string;
}

export type CosmosDBMongoInput = FunctionInput & CosmosDBMongoInputOptions;

/**
 * Options for configuring a CosmosDB Mongo output binding.
 */
export interface CosmosDBMongoOutputOptions {
    /**
     * An app setting (or environment variable) with the MongoDB connection string.
     * Defaults to "CosmosDBMongo" if not specified.
     */
    connectionStringSetting: string;

    /**
     * The name of the database to write to.
     */
    databaseName: string;

    /**
     * The name of the collection to write to.
     */
    collectionName: string;

    /**
     * Whether to create the collection if it does not exist.
     * Default is false.
     */
    createIfNotExists?: boolean;

    /**
     * The Azure AD tenant ID used for managed identity authentication.
     */
    tenantId?: string;

    /**
     * The managed identity client ID for user-assigned managed identity authentication.
     */
    managedIdentityClientId?: string;
}

export type CosmosDBMongoOutput = FunctionOutput & CosmosDBMongoOutputOptions;
