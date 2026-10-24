// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { TriggerMetadata } from '@azure/functions';
import { RpcTypedData } from '@azure/functions-core';
import { isHttpTrigger, isTimerTrigger } from '../utils/isTrigger';
import { fromRpcTypedData } from './fromRpcTypedData';
import { toCamelCaseKey, toCamelCaseValue } from './toCamelCase';

export function fromRpcTriggerMetadata(
    triggerMetadata: Record<string, RpcTypedData> | null | undefined,
    triggerType: string
): TriggerMetadata | undefined {
    // For http and timer triggers, we will avoid using `triggerMetadata` for a few reasons:
    // 1. It uses `toCamelCase` methods, which can lead to weird casing bugs
    // 2. It's generally a large medley of properties that is difficult for us to document/type
    // 3. We can represent that information on the request & timer objects instead
    if (!triggerMetadata || isHttpTrigger(triggerType) || isTimerTrigger(triggerType)) {
        return undefined;
    } else {
        const result: TriggerMetadata = {};
        for (const [key, value] of Object.entries(triggerMetadata)) {
            const camelCaseKey = toCamelCaseKey(key);
            const processedValue = toCamelCaseValue(fromRpcTypedData(value));
            result[camelCaseKey] = fixDateFormatForServiceBus(camelCaseKey, processedValue, triggerType);
        }
        return result;
    }
}

/**
 * Fix date format for serviceBus triggers to ensure proper timezone information.
 * Adds 'Z' suffix to date strings that are missing timezone information.
 */
function fixDateFormatForServiceBus(key: string, value: unknown, triggerType: string): unknown {
    // Only apply to serviceBus triggers
    if (!triggerType.includes('serviceBus')) {
        return value;
    }

    // Only apply to known date fields
    const dateFields = ['enqueuedTimeUtc', 'expiresAtUtc'];
    if (!dateFields.includes(key)) {
        return value;
    }

    // Only apply to strings that look like dates without timezone
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?$/.test(value)) {
        return value + 'Z';
    }

    return value;
}
