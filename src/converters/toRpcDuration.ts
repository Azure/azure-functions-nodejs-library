// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcDuration } from '@azure/functions-core';
import { Duration } from '../../types';
import { AzFuncSystemError } from '../errors';
import { isDefined } from '../utils/nonNull';

export function toRpcDuration(dateTime: Duration | number | undefined, propertyName: string): RpcDuration | undefined {
    if (isDefined(dateTime)) {
        try {
            let timeInMilliseconds: number | undefined;
            if (typeof dateTime === 'object') {
                const minutes = (dateTime.minutes || 0) + (dateTime.hours || 0) * 60;
                const seconds = (dateTime.seconds || 0) + minutes * 60;
                timeInMilliseconds = (dateTime.milliseconds || 0) + seconds * 1000;
            } else if (typeof dateTime === 'number') {
                timeInMilliseconds = dateTime;
            }

            if (isDefined(timeInMilliseconds) && timeInMilliseconds >= 0) {
                return {
                    seconds: Math.round(timeInMilliseconds / 1000),
                };
            }
        } catch {
            // fall through
        }

        throw new AzFuncSystemError(
            `A 'number' or 'Duration' object was expected instead of a '${typeof dateTime}'. Cannot parse value of '${propertyName}'.`
        );
    }

    return undefined;
}
