// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { ExponentialBackoffRetryOptions, FixedDelayRetryOptions, GenericFunctionOptions } from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import { returnBindingKey } from '../constants';
import { AzFuncSystemError } from '../errors';
import { isTrigger } from '../utils/isTrigger';
import { toRpcDuration } from './toRpcDuration';

export function toCoreFunctionMetadata(name: string, options: GenericFunctionOptions): coreTypes.FunctionMetadata {
    const bindings: Record<string, coreTypes.RpcBindingInfo> = {};
    const bindingNames: string[] = [];
    const trigger = options.trigger;
    console.log('toCoreFunctionMetadata: Handle', JSON.stringify(options));
    console.log('toCoreFunctionMetadata: deferredBindingType', options.trigger.deferredBindingType);

    bindings[trigger.name] = {
        ...trigger,
        direction: 'in',
        type: isTrigger(trigger.type) ? trigger.type : trigger.type + 'Trigger',
        properties: addDeferredBindingsFlag(options.trigger?.deferredBinding),
    };
    bindingNames.push(trigger.name);

    if (options.extraInputs) {
        for (const input of options.extraInputs) {
            bindings[input.name] = {
                ...input,
                direction: 'in',
                properties: addDeferredBindingsFlag(input?.deferredBinding),
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

function addDeferredBindingsFlag(deferredBindingType?: boolean | unknown): { [key: string]: string } {
    //Ensure that trigger type that is passed is valid and supported, to avoid customer misconfiguration.
    console.log('Deferred binding flag value is: ', deferredBindingType);
    if (deferredBindingType !== undefined && deferredBindingType === true) {
        console.log('Adding deferred binding propertyu to trigger type:', deferredBindingType);
        return { supportsDeferredBinding: 'true' };
    }

    return { supportsDeferredBinding: 'false' };
}
