// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

export function toCamelCaseValue(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(toCamelCaseValue);
    }

    const result = {};
    for (const [key, value] of Object.entries(data)) {
        result[toCamelCaseKey(key)] = toCamelCaseValue(value);
    }

    return result;
}

export function toCamelCaseKey(key: string): string {
    return key.charAt(0).toLowerCase() + key.slice(1);
}
