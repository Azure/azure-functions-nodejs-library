// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { ModelBindingData } from '@azure/functions-core';

export interface ConnectionInfoContent {
    Connection: string;
    ContainerName: string;
    BlobName: string;
}

export class ConnectionInfo {
    version: string;
    source: string;
    contentType: string;
    content: ConnectionInfoContent | undefined;

    constructor(modelBindingData: ModelBindingData) {
        this.version = modelBindingData.version as string;
        this.source = modelBindingData.source as string;
        this.contentType = modelBindingData.contentType as string;
        this.content = modelBindingData.content
            ? (JSON.parse(modelBindingData.content.toString()) as ConnectionInfoContent)
            : undefined;
    }
}
