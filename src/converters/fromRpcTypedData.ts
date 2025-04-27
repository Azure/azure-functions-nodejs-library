// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcTypedData } from '@azure/functions-core';
import { buildClientFromModelBindingData } from '../deferred-binding/connectionBuilder';
import { HttpRequest } from '../http/HttpRequest';
import { isDefined } from '../utils/nonNull';

export function fromRpcTypedData(data: RpcTypedData | null | undefined): unknown {
    console.log('fromRpcTypedData input:', data);

    if (!data) {
        console.log('Condition: !data - returning undefined');
        return undefined;
    } else if (isDefined(data.string)) {
        const result = tryJsonParse(data.string);
        console.log('Condition: data.string - returning:', result);
        return result;
    } else if (isDefined(data.json)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = JSON.parse(data.json);
        console.log('Condition: data.json - returning:', result);
        return result;
    } else if (isDefined(data.bytes)) {
        const result = Buffer.from(data.bytes);
        console.log('Condition: data.bytes - returning Buffer of length:', result.length);
        return result;
    } else if (isDefined(data.stream)) {
        const result = Buffer.from(data.stream);
        console.log('Condition: data.stream - returning Buffer of length:', result.length);
        return result;
    } else if (isDefined(data.http)) {
        const result = new HttpRequest(data.http);
        console.log('Condition: data.http - returning HttpRequest');
        return result;
    } else if (isDefined(data.int)) {
        console.log('Condition: data.int - returning:', data.int);
        return data.int;
    } else if (isDefined(data.double)) {
        console.log('Condition: data.double - returning:', data.double);
        return data.double;
    } else if (data.collectionBytes && isDefined(data.collectionBytes.bytes)) {
        const result = data.collectionBytes.bytes.map((d) => Buffer.from(d));
        console.log('Condition: data.collectionBytes - returning array of Buffers, count:', result.length);
        return result;
    } else if (data.collectionString && isDefined(data.collectionString.string)) {
        const result = data.collectionString.string.map(tryJsonParse);
        console.log('Condition: data.collectionString - returning:', result);
        return result;
    } else if (data.collectionDouble && isDefined(data.collectionDouble.double)) {
        console.log('Condition: data.collectionDouble - returning:', data.collectionDouble.double);
        return data.collectionDouble.double;
    } else if (data.collectionSint64 && isDefined(data.collectionSint64.sint64)) {
        console.log('Condition: data.collectionSint64 - returning:', data.collectionSint64.sint64);
        return data.collectionSint64.sint64;
    } else if (data.modelBindingData && isDefined(data.modelBindingData.content)) {
        console.log('Here at the modelBindinData', data.modelBindingData);
        return buildClientFromModelBindingData(data.modelBindingData);
        //return data.modelBindingData;
    } else {
        console.log('Condition: none matched - returning undefined');
        return undefined;
    }
}

function tryJsonParse(data: string): unknown {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsed = JSON.parse(data);
        console.log('tryJsonParse: successfully parsed JSON');
        return parsed;
    } catch {
        console.log('tryJsonParse: failed to parse JSON, returning original string');
        return data;
    }
}
