// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcNullableString } from '@azure/functions-core';

export function fromNullableMapping(
    nullableMapping: Record<string, RpcNullableString> | null | undefined,
    originalMapping?: Record<string, string> | null
): Record<string, string> {
    let converted: Record<string, string> = {};
    if (nullableMapping && Object.keys(nullableMapping).length > 0) {
        for (const key in nullableMapping) {
            converted[key] = nullableMapping[key]?.value || '';
        }
    } else if (originalMapping && Object.keys(originalMapping).length > 0) {
        converted = originalMapping;
    }
    return converted;
}
