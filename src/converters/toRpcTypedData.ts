// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcTypedData } from '@azure/functions-core';

export function toRpcTypedData(data: unknown): RpcTypedData | null | undefined {
    if (data === null || data === undefined) {
        return data;
    }

    if (typeof data === 'string') {
        return { string: data };
    }

    if (Buffer.isBuffer(data)) {
        return { bytes: data };
    }

    if (ArrayBuffer.isView(data)) {
        const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        return { bytes: bytes };
    }

    if (data instanceof ArrayBuffer) {
        const bytes = new Uint8Array(data);
        return { bytes: bytes };
    }

    if (typeof data === 'number') {
        return Number.isInteger(data) ? { int: data } : { double: data };
    }

    if (typeof data === 'object' && 'data' in data) {
        return { modelBindingData: data } as RpcTypedData;
    }

    return { json: JSON.stringify(data) };
}
