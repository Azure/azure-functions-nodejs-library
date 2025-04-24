// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { ModelBindingData } from '@azure/functions-core';

export type BlobConnectionDetails = {
    Connection: string;
    ContainerName: string;
    BlobName: string;
};

// Define the `ServiceBusConnectionInfo` type that extends `ConnectionInfo`
//TODO Define other connectionInfo example ServiceBusConnectionDetails

/**
 * Type Guard to check if an object is of type BlobConnectionInfo
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
function isBlobConnectionDetails(obj: unknown): obj is BlobConnectionDetails {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        'Connection' in obj &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof (obj as any).Connection === 'string' &&
        'ContainerName' in obj &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof (obj as any).ContainerName === 'string' &&
        'BlobName' in obj &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof (obj as any).BlobName === 'string'
    );
}

/**
 * Function to parse JSON and determine its type
 * @param jsonBuffer Bufer that holds the JSON string to parse
 * @returns Either `BlobConnectionDetails` or `ServiceBusConnectionDetails`
 */
export function parseConnectionDetails(jsonBuffer: Buffer | null | undefined): BlobConnectionDetails {
    if (jsonBuffer === null || jsonBuffer === undefined) {
        throw new Error('Connection details content is null or undefined');
    }
    const parsedObject: unknown = JSON.parse(jsonBuffer.toString());

    if (isBlobConnectionDetails(parsedObject)) {
        return parsedObject;
    }
    //TODO add other parser for different resource types
    else {
        throw new Error('Invalid connection info type');
    }
}

/**
 * Type guard to check if an object conforms to the ModelBindingData interface
 * @param obj Object to check
 * @returns True if object is ModelBindingData
 */
export function isModelBindingData(obj: unknown): obj is ModelBindingData {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    const candidate = obj as Record<string, unknown>;

    // Check content property if it exists
    if (
        'content' in candidate &&
        candidate.content !== null &&
        candidate.content !== undefined &&
        candidate.content instanceof Buffer
    ) {
        return false;
    }

    // Check string properties if they exist
    const stringProps = ['contentType', 'source', 'version'];
    for (const prop of stringProps) {
        if (
            prop in candidate &&
            candidate[prop] !== null &&
            candidate[prop] !== undefined &&
            typeof candidate[prop] !== 'string'
        ) {
            return false;
        }
    }
    return true;
}
