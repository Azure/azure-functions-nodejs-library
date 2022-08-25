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
            result[toCamelCaseKey(key)] = toCamelCaseValue(fromRpcTypedData(value));
        }
        return result;
    }
}
