// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

export interface ModelBindingData {
    content?: Buffer | null;
    contentType?: string | null;
    source?: string | null;
    version?: string | null;
}

export interface ConnectionInfoContent {
    Connection: string;
    ContainerName: string;
    BlobName: string;
}

export declare class ConnectionInfo {
    version: string;
    source: string;
    contentType: string;
    content: ConnectionInfoContent | undefined;

    constructor(modelBindingData: ModelBindingData);
}
