// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcTypedData } from '@azure/functions-core';

export function toRpcTypedData(data: unknown): RpcTypedData | null | undefined {
    console.log('toRpcTypedData input:', typeof data, data);

    if (data === null || data === undefined) {
        console.log('Condition: null/undefined - returning:', data);
        return data;
    } else if (typeof data === 'string') {
        console.log('Condition: string - returning:', { string: data });
        return { string: data };
    } else if (Buffer.isBuffer(data)) {
        console.log('Condition: Buffer - returning bytes of length:', data.length);
        return { bytes: data };
    } else if (ArrayBuffer.isView(data)) {
        const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        console.log('Condition: ArrayBufferView - returning Uint8Array of length:', bytes.length);
        return { bytes: bytes };
    } else if (data instanceof ArrayBuffer) {
        const bytes = new Uint8Array(data);
        console.log('Condition: ArrayBuffer - returning Uint8Array of length:', bytes.length);
        return { bytes: bytes };
    } else if (typeof data === 'number') {
        if (Number.isInteger(data)) {
            console.log('Condition: integer number - returning:', { int: data });
            return { int: data };
        } else {
            console.log('Condition: floating-point number - returning:', { double: data });
            return { double: data };
        }
    } else {
        const jsonString = JSON.stringify(data);
        console.log('Condition: other (converted to JSON) - returning:', { json: jsonString });
        return { json: jsonString };
    }
}
