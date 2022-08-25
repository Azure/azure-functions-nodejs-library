// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcTypedData } from '@azure/functions-core';
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
    } else {
        return undefined;
    }
}

function tryJsonParse(data: string): unknown {
    try {
        return JSON.parse(data);
    } catch {
        return data;
    }
}
