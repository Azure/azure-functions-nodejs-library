// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

export function extractLogAttributes(argument: unknown): ExtractedLogAttributes {
    if (typeof argument !== 'object' || argument === null) {
        return { rejectedCount: 0 };
    }
    try {
        const prototype: unknown = Object.getPrototypeOf(argument);
        if (prototype !== Object.prototype && prototype !== null) {
            return { rejectedCount: 0 };
        }
        const attributes: Record<string, string | number | boolean> = Object.create(null) as Record<
            string,
            string | number | boolean
        >;
        let rejectedCount = 0;
        for (const propertyName of Object.getOwnPropertyNames(argument)) {
            const descriptor = Object.getOwnPropertyDescriptor(argument, propertyName);
            if (!descriptor?.enumerable) {
                continue;
            }
            const propertyValue: unknown = descriptor.value;
            if (!('value' in descriptor) || isReservedLogProperty(propertyName) || !isLogPropertyValue(propertyValue)) {
                rejectedCount++;
            } else {
                attributes[propertyName] = propertyValue;
            }
        }
        return {
            attributes: Object.freeze(attributes),
            rejectedCount,
            reason: rejectedCount ? 'structured_log_invalid_properties' : undefined,
        };
    } catch {
        return { rejectedCount: 0, reason: 'structured_log_inspection_failed' };
    }
}

function isReservedLogProperty(propertyName: string): boolean {
    const name = propertyName.toLowerCase();
    return (
        name === 'categoryname' ||
        name === '__proto__' ||
        name === 'prototype' ||
        name === 'constructor' ||
        ['exception.', '_ms', 'microsoft', 'ai.'].some((prefix) => name.startsWith(prefix))
    );
}

function isLogPropertyValue(propertyValue: unknown): propertyValue is string | number | boolean {
    return (
        typeof propertyValue === 'string' ||
        typeof propertyValue === 'boolean' ||
        (typeof propertyValue === 'number' && Number.isFinite(propertyValue))
    );
}

interface ExtractedLogAttributes {
    attributes?: Readonly<Record<string, string | number | boolean>>;
    rejectedCount: number;
    reason?: 'structured_log_invalid_properties' | 'structured_log_inspection_failed';
}
