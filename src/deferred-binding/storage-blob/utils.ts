// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

/**
 * Validates and returns the connection string. If the connection string is
 * not an environment variable, an error will be thrown.
 *
 * There are four cases:
 * 1. Not using managed identity: the environment variable exists as is
 * 2. Using managed identity for blob input: __serviceUri must be appended
 * 3. Using managed identity for blob trigger: __blobServiceUri must be appended
 * 4. None of these cases existed, so the connection variable is invalid.
 */
export function getConnectionString(connectionString: string | undefined): string {
    if (!connectionString) {
        throw new Error(
            'Storage account connection string cannot be undefined. ' + 'Please provide a connection string.'
        );
    }

    if (process.env[connectionString]) {
        return process.env[connectionString] as string;
    } else if (process.env[`${connectionString}__serviceUri`]) {
        return process.env[`${connectionString}__serviceUri`] as string;
    } else if (process.env[`${connectionString}__blobServiceUri`]) {
        return process.env[`${connectionString}__blobServiceUri`] as string;
    } else {
        throw new Error(
            `Storage account connection string ${connectionString} does not exist. ` +
                `Please make sure that it is a defined environment variable.`
        );
    }
}

/**
 * To determine if managed identity is being used, we check if the provided
 * connection string has either of the two suffixes:
 * __serviceUri or __blobServiceUri.
 */
export function isSystemBasedManagedIdentity(connectionName: string): boolean {
    return (
        process.env[`${connectionName}__serviceUri`] !== undefined ||
        process.env[`${connectionName}__blobServiceUri`] !== undefined
    );
}

/**
 * Determines if a user-assigned managed identity is being used for authentication.
 *
 * User-assigned managed identities in Azure Functions are identified by the presence of:
 * - ${connectionName}__clientId: The client ID of the user-assigned managed identity
 * - ${connectionName}__credential: The credential type being used
 *
 * This differs from system-assigned managed identities, which don't require a client ID.
 *
 * @param connectionName - The base name of the connection setting
 * @returns boolean indicating if a user-assigned managed identity is configured
 */
export function isUserBasedManagedIdentity(connectionName: string): boolean {
    return (
        process.env[`${connectionName}__clientId`] !== undefined &&
        process.env[`${connectionName}__credential`] !== undefined &&
        process.env[`${connectionName}__serviceUri`] !== undefined
    );
}
