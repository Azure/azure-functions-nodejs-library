// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { BindingDefinition, ContextBindingData } from '@azure/functions';
import { RpcInvocationRequest } from '@azure/functions-core';
import { FunctionInfo } from '../FunctionInfo';
import { fromTypedData } from './RpcConverters';

export function getBindingDefinitions(info: FunctionInfo): BindingDefinition[] {
    const bindings = info.bindings;
    if (!bindings) {
        return [];
    }

    return Object.keys(bindings).map((name) => {
        return {
            name: name,
            type: bindings[name].type || '',
            direction: bindings[name].direction || undefined,
        };
    });
}

export function getNormalizedBindingData(request: RpcInvocationRequest): ContextBindingData {
    const bindingData: ContextBindingData = {
        invocationId: <string>request.invocationId,
    };

    // node binding data is camel cased due to language convention
    if (request.triggerMetadata) {
        Object.assign(bindingData, convertKeysToCamelCase(request.triggerMetadata));
    }
    return bindingData;
}

// Recursively convert keys of objects to camel case
export function convertKeysToCamelCase(obj: any) {
    const output = {};
    for (const key in obj) {
        const camelCasedKey = key.charAt(0).toLocaleLowerCase() + key.slice(1);
        try {
            // Only "undefined" will be replaced with original object property. For example:
            //{ string : "0" } -> 0
            //{ string : "false" } -> false
            //"test" -> "test" (undefined returned from fromTypedData)
            const valueFromDataType = fromTypedData(obj[key]);
            const value = valueFromDataType === undefined ? obj[key] : valueFromDataType;
            // If the value is a JSON object (and not array and not http, which is already cased), convert keys to camel case
            if (!Array.isArray(value) && typeof value === 'object' && value && value.http == undefined) {
                output[camelCasedKey] = convertKeysToCamelCase(value);
            } else {
                output[camelCasedKey] = value;
            }
        } catch {
            // Just use the original value if we failed to recursively convert for any reason
            output[camelCasedKey] = obj[key];
        }
    }
    return output;
}
