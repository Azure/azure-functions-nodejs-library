// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { EffectiveFunctionOptions, FunctionInput, FunctionOutput, FunctionTrigger } from '@azure/functions';
import { RpcBindingInfo } from '@azure/functions-core';
import { returnBindingKey } from '../constants';
import { isTrigger } from '../utils/isTrigger';
import { nonNullProp, nonNullValue } from '../utils/nonNull';

export function fromRpcBindings(bindings: Record<string, RpcBindingInfo> | null | undefined): EffectiveFunctionOptions {
    let trigger: FunctionTrigger | undefined;
    let returnBinding: FunctionOutput | undefined;
    const extraInputs: FunctionInput[] = [];
    const extraOutputs: FunctionOutput[] = [];
    for (const [name, binding] of Object.entries(nonNullValue(bindings, 'bindings'))) {
        if (isTrigger(binding.type)) {
            trigger = fromRpcBinding(name, binding);
        } else if (name === returnBindingKey) {
            returnBinding = fromRpcBinding(name, binding);
        } else if (binding.direction === 'in') {
            extraInputs.push(fromRpcBinding(name, binding));
        } else if (binding.direction === 'out') {
            extraOutputs.push(fromRpcBinding(name, binding));
        }
    }
    return {
        trigger: nonNullValue(trigger, 'trigger'),
        return: returnBinding,
        extraInputs,
        extraOutputs,
    };
}

function fromRpcBinding(name: string, binding: RpcBindingInfo): FunctionTrigger | FunctionInput | FunctionOutput {
    return {
        ...binding,
        type: nonNullProp(binding, 'type'),
        name,
    };
}
