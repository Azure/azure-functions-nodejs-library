// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcTypedData } from '@azure/functions-core';

export function toRpcTypedData(data: unknown): RpcTypedData | null | undefined {
    if (data === null || data === undefined) {
        return data;
    } else if (typeof data === 'string') {
        return { string: data };
    } else if (Buffer.isBuffer(data)) {
        return { bytes: data };
    } else if (ArrayBuffer.isView(data)) {
        const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        return { bytes: bytes };
    } else if (data instanceof ArrayBuffer) {
        const bytes = new Uint8Array(data);
        return { bytes: bytes };
    } else if (typeof data === 'number') {
        if (Number.isInteger(data)) {
            return { int: data };
        } else {
            return { double: data };
        }
    } else {
        return { json: JSON.stringify(data) };
    }
}
