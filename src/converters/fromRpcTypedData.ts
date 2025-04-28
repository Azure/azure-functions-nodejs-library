// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcTypedData } from '@azure/functions-core';
import { AzureStorageBlobClientFactory } from '../deferred-binding/storage-blob/azureStorageBlobClientFactory';
import { HttpRequest } from '../http/HttpRequest';
import { isDefined } from '../utils/nonNull';

export function fromRpcTypedData(data: RpcTypedData | null | undefined): unknown {
    if (!data) {
        return undefined;
    } else if (isDefined(data.string)) {
        const result = tryJsonParse(data.string);
        return result;
    } else if (isDefined(data.json)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = JSON.parse(data.json);
        return result;
    } else if (isDefined(data.bytes)) {
        const result = Buffer.from(data.bytes);
        return result;
    } else if (isDefined(data.stream)) {
        const result = Buffer.from(data.stream);
        return result;
    } else if (isDefined(data.http)) {
        const result = new HttpRequest(data.http);
        return result;
    } else if (isDefined(data.int)) {
        console.log('Condition: data.int - returning:', data.int);
        return data.int;
    } else if (isDefined(data.double)) {
        console.log('Condition: data.double - returning:', data.double);
        return data.double;
    } else if (data.collectionBytes && isDefined(data.collectionBytes.bytes)) {
        const result = data.collectionBytes.bytes.map((d) => Buffer.from(d));
        return result;
    } else if (data.collectionString && isDefined(data.collectionString.string)) {
        const result = data.collectionString.string.map(tryJsonParse);
        return result;
    } else if (data.collectionDouble && isDefined(data.collectionDouble.double)) {
        return data.collectionDouble.double;
    } else if (data.collectionSint64 && isDefined(data.collectionSint64.sint64)) {
        return data.collectionSint64.sint64;
    } else if (data.modelBindingData && isDefined(data.modelBindingData.content)) {
        return AzureStorageBlobClientFactory.buildClientFromModelBindingData(data.modelBindingData);
        //return data.modelBindingData;
    } else {
        return undefined;
    }
}

function tryJsonParse(data: string): unknown {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsed = JSON.parse(data);
        return parsed;
    } catch {
        return data;
    }
}
