// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

export function isTrigger(typeName: string | undefined | null): boolean {
    return !!typeName && /trigger$/i.test(typeName);
}

export function isHttpTrigger(typeName: string | undefined | null): boolean {
    return typeName?.toLowerCase() === 'httptrigger';
}

export function isTimerTrigger(typeName: string | undefined | null): boolean {
    return typeName?.toLowerCase() === 'timertrigger';
}
