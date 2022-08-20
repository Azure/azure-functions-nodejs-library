// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { fromRpcTypedData } from './fromRpcTypedData';

// Recursively convert keys of objects to camel case
export function convertKeysToCamelCase(obj: any): { [key: string]: any } {
    const output = {};
    for (const key in obj) {
        // Only "undefined" will be replaced with original object property. For example:
        //{ string : "0" } -> 0
        //{ string : "false" } -> false
        //"test" -> "test" (undefined returned from fromTypedData)
        const valueFromDataType = fromRpcTypedData(obj[key]);
        const value = valueFromDataType === undefined ? obj[key] : valueFromDataType;
        const camelCasedKey = key.charAt(0).toLocaleLowerCase() + key.slice(1);
        // If the value is a JSON object (and not array and not http, which is already cased), convert keys to camel case
        if (!Array.isArray(value) && typeof value === 'object' && value && value.http == undefined) {
            output[camelCasedKey] = convertKeysToCamelCase(value);
        } else {
            output[camelCasedKey] = value;
        }
    }
    return output;
}
