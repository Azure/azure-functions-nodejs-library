// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { ExponentialBackoffRetryOptions, FixedDelayRetryOptions, GenericFunctionOptions } from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import { returnBindingKey } from '../constants';
import { isTrigger } from '../utils/isTrigger';
import { toRpcDuration } from './toRpcDuration';

export function toCoreFunctionMetadata(name: string, options: GenericFunctionOptions): coreTypes.FunctionMetadata {
    const bindings: Record<string, coreTypes.RpcBindingInfo> = {};

    const trigger = options.trigger;
    bindings[trigger.name] = {
        ...trigger,
        direction: 'in',
        type: isTrigger(trigger.type) ? trigger.type : trigger.type + 'Trigger',
    };

    if (options.extraInputs) {
        for (const input of options.extraInputs) {
            bindings[input.name] = {
                ...input,
                direction: 'in',
            };
        }
    }

    if (options.return) {
        bindings[returnBindingKey] = {
            ...options.return,
            direction: 'out',
        };
    }

    if (options.extraOutputs) {
        for (const output of options.extraOutputs) {
            bindings[output.name] = {
                ...output,
                direction: 'out',
            };
        }
    }

    let retryOptions: coreTypes.RpcRetryOptions | undefined;
    if (options.retry) {
        retryOptions = {
            ...options.retry,
            retryStrategy: options.retry.strategy,
            delayInterval: toRpcDuration((<FixedDelayRetryOptions>options.retry).delayInterval, 'retry.delayInterval'),
            maximumInterval: toRpcDuration(
                (<ExponentialBackoffRetryOptions>options.retry).maximumInterval,
                'retry.maximumInterval'
            ),
            minimumInterval: toRpcDuration(
                (<ExponentialBackoffRetryOptions>options.retry).minimumInterval,
                'retry.minimumInterval'
            ),
        };
    }

    return { name, bindings, retryOptions };
}
