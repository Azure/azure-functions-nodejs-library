// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcNullableString } from '@azure/functions-core';

export function fromNullableMapping(
    nullableMapping: { [k: string]: RpcNullableString } | null | undefined,
    originalMapping?: { [k: string]: string } | null
): { [key: string]: string } {
    let converted = {};
    if (nullableMapping && Object.keys(nullableMapping).length > 0) {
        for (const key in nullableMapping) {
            converted[key] = nullableMapping[key].value || '';
        }
    } else if (originalMapping && Object.keys(originalMapping).length > 0) {
        converted = <{ [key: string]: string }>originalMapping;
    }
    return converted;
}
