// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcTypedData } from '@azure/functions-core';
import { isLong } from 'long';

export function fromRpcTypedData(typedData?: RpcTypedData, convertStringToJson = true) {
    typedData = typedData || {};
    let str = typedData.string || typedData.json;
    if (str !== undefined) {
        if (convertStringToJson) {
            try {
                if (str != null) {
                    str = JSON.parse(str);
                }
            } catch (err) {
                // ignore
            }
        }
        return str;
    } else if (typedData.bytes) {
        return Buffer.from(<Buffer>typedData.bytes);
    } else if (typedData.collectionBytes && typedData.collectionBytes.bytes) {
        const byteCollection = typedData.collectionBytes.bytes;
        return byteCollection.map((element) => Buffer.from(<Buffer>element));
    } else if (typedData.collectionString && typedData.collectionString.string) {
        return typedData.collectionString.string;
    } else if (typedData.collectionDouble && typedData.collectionDouble.double) {
        return typedData.collectionDouble.double;
    } else if (typedData.collectionSint64 && typedData.collectionSint64.sint64) {
        const longCollection = typedData.collectionSint64.sint64;
        return longCollection.map((element) => (isLong(element) ? element.toString() : element));
    }
}
