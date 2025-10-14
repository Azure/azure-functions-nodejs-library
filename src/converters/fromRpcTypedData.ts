// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcTypedData } from '@azure/functions-core';
import { ResourceFactoryResolver } from '@azure/functions-extensions-base';
import { HttpRequest } from '../http/HttpRequest';
import { isDefined } from '../utils/nonNull';

export function fromRpcTypedData(data: RpcTypedData | null | undefined): unknown {
    if (!data) {
        return undefined;
    } else if (isDefined(data.string)) {
        return tryJsonParse(data.string);
    } else if (isDefined(data.json)) {
        return JSON.parse(data.json);
    } else if (isDefined(data.bytes)) {
        return Buffer.from(data.bytes);
    } else if (isDefined(data.stream)) {
        return Buffer.from(data.stream);
    } else if (isDefined(data.http)) {
        return new HttpRequest(data.http);
    } else if (isDefined(data.int)) {
        return data.int;
    } else if (isDefined(data.double)) {
        return data.double;
    } else if (data.collectionBytes && isDefined(data.collectionBytes.bytes)) {
        return data.collectionBytes.bytes.map((d) => Buffer.from(d));
    } else if (data.collectionString && isDefined(data.collectionString.string)) {
        return data.collectionString.string.map(tryJsonParse);
    } else if (data.collectionDouble && isDefined(data.collectionDouble.double)) {
        return data.collectionDouble.double;
    } else if (data.collectionSint64 && isDefined(data.collectionSint64.sint64)) {
        return data.collectionSint64.sint64;
    } else if (data.modelBindingData && isDefined(data.modelBindingData.content)) {
        try {
            const resourceFactoryResolver: ResourceFactoryResolver = ResourceFactoryResolver.getInstance();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            return resourceFactoryResolver.createClient(data.modelBindingData.source, data.modelBindingData);
        } catch (exception) {
            throw new Error(
                'Unable to create client. Please register the extensions library with your function app. ' +
                    `Error: ${exception instanceof Error ? exception.message : String(exception)}`
            );
        }
    } else if (
        data.collectionModelBindingData &&
        isDefined(data.collectionModelBindingData.modelBindingData) &&
        data.collectionModelBindingData.modelBindingData.length > 0
    ) {
        try {
            const resourceFactoryResolver: ResourceFactoryResolver = ResourceFactoryResolver.getInstance();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            return resourceFactoryResolver.createClient(
                data.collectionModelBindingData.modelBindingData[0]?.source,
                data.collectionModelBindingData.modelBindingData
            );
        } catch (exception) {
            throw new Error(
                'Unable to create client. Please register the extensions library with your function app. ' +
                    `Error: ${exception instanceof Error ? exception.message : String(exception)}`
            );
        }
    }
}

function tryJsonParse(data: string): unknown {
    try {
        return JSON.parse(data);
    } catch {
        return data;
    }
}
