// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { ExponentialBackoffRetryOptions, FixedDelayRetryOptions, GenericFunctionOptions } from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import { returnBindingKey } from '../constants';
import { AzFuncSystemError } from '../errors';
import { isTrigger } from '../utils/isTrigger';
import { workerSystemLog } from '../utils/workerSystemLog';
import { toRpcDuration } from './toRpcDuration';

export function toCoreFunctionMetadata(name: string, options: GenericFunctionOptions): coreTypes.FunctionMetadata {
    const bindings: Record<string, coreTypes.RpcBindingInfo> = {};
    const bindingNames: string[] = [];
    const trigger = options.trigger;

    bindings[trigger.name] = {
        ...trigger,
        direction: 'in',
        type: isTrigger(trigger.type) ? trigger.type : trigger.type + 'Trigger',
        properties: addSdkBindingsFlag(options.trigger?.sdkBinding, name, trigger.type, trigger.name, false),
    };
    bindingNames.push(trigger.name);

    if (options.extraInputs) {
        for (const input of options.extraInputs) {
            bindings[input.name] = {
                ...input,
                direction: 'in',
                properties: addSdkBindingsFlag(input?.sdkBinding, name, input.type, input.name, true),
            };
            bindingNames.push(input.name);
        }
    }

    if (options.return) {
        bindings[returnBindingKey] = {
            ...options.return,
            direction: 'out',
        };
        bindingNames.push(returnBindingKey);
    }

    if (options.extraOutputs) {
        for (const output of options.extraOutputs) {
            bindings[output.name] = {
                ...output,
                direction: 'out',
            };
            bindingNames.push(output.name);
        }
    }

    const dupeBindings = bindingNames.filter((v, i) => bindingNames.indexOf(v) !== i);
    if (dupeBindings.length > 0) {
        throw new AzFuncSystemError(
            `Duplicate bindings found for function "${name}". Remove a duplicate binding or manually specify the "name" property to make it unique.`
        );
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

/**
 * Adds the deferred binding flags to function bindings based on the binding configuration
 * @param sdkBindingType Boolean indicating if this is an SDK binding
 * @param functionName The name of the function for logging purposes
 * @param triggerType The type of the trigger or binding
 * @param bindingOrTriggerName The name of the trigger or binding
 * @param isBinding Boolean indicating if this is a binding (vs a trigger)
 * @returns Object with supportsDeferredBinding property set to 'true' or 'false'
 */
export function addSdkBindingsFlag(
    sdkBindingType?: boolean | unknown,
    functionName?: string,
    triggerType?: string,
    bindingOrTriggerName?: string,
    isBinding?: boolean
): { [key: string]: string } {
    // Ensure that trigger type is valid and supported
    if (sdkBindingType !== undefined && sdkBindingType === true) {
        const entityType = isBinding ? 'binding' : 'trigger';

        // Create structured JSON log entry
        const logData = {
            operation: 'EnableDeferredBinding',
            properties: {
                functionName: functionName || 'unknown',
                entityType: entityType,
                triggerType: triggerType || 'unknown',
                bindingOrTriggerName: bindingOrTriggerName || 'unknown',
                supportsDeferredBinding: true,
            },
            message: `Enabled Deferred Binding of type '${triggerType || 'unknown'}' for function '${
                functionName || 'unknown'
            }'`,
        };
        // Log both the structured data
        workerSystemLog('information', JSON.stringify(logData));
        return { supportsDeferredBinding: 'true' };
    }

    return { supportsDeferredBinding: 'false' };
}
