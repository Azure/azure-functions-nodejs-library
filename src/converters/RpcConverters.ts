// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Exception, RetryContext, TraceContext } from '@azure/functions';
import {
    RpcException,
    RpcNullableBool,
    RpcNullableDouble,
    RpcNullableString,
    RpcNullableTimestamp,
    RpcRetryContext,
    RpcTraceContext,
    RpcTypedData,
} from '@azure/functions-core';
import { isLong } from 'long';
import { InternalException } from '../utils/InternalException';
import { copyPropIfDefined, nonNullProp } from '../utils/nonNull';

/**
 * Converts 'ITypedData' input from the RPC layer to JavaScript types.
 * TypedData can be string, json, or bytes
 * @param typedData ITypedData object containing one of a string, json, or bytes property
 * @param convertStringToJson Optionally parse the string input type as JSON
 */
export function fromTypedData(typedData?: RpcTypedData, convertStringToJson = true) {
    typedData = typedData || {};
    let str = typedData.string || typedData.json;
    if (str !== undefined) {
        if (convertStringToJson) {
            try {
                if (str != null) {
                    str = JSON.parse(str);
                }
            } catch (err) {}
        }
        return str;
    } else if (typedData.bytes) {
        return Buffer.from(<Buffer>typedData.bytes);
    } else if (typedData.collectionBytes && typedData.collectionBytes.bytes) {
        const byteCollection = typedData.collectionBytes.bytes;
        return byteCollection.map((element) => Buffer.from(<Buffer>element));
    } else if (typedData.collectionString && typedData.collectionString.string) {
        return typedData.collectionString.string;
    } else if (typedData.collectionDouble && typedData.collectionDouble.double) {
        return typedData.collectionDouble.double;
    } else if (typedData.collectionSint64 && typedData.collectionSint64.sint64) {
        const longCollection = typedData.collectionSint64.sint64;
        return longCollection.map((element) => (isLong(element) ? element.toString() : element));
    }
}

export function fromRpcRetryContext(retryContext: RpcRetryContext): RetryContext {
    const result: RetryContext = {
        retryCount: nonNullProp(retryContext, 'retryCount'),
        maxRetryCount: nonNullProp(retryContext, 'maxRetryCount'),
    };
    if (retryContext.exception) {
        result.exception = fromRpcException(retryContext.exception);
    }
    return result;
}

function fromRpcException(exception: RpcException): Exception {
    const result: Exception = {};
    copyPropIfDefined(exception, result, 'message');
    copyPropIfDefined(exception, result, 'source');
    copyPropIfDefined(exception, result, 'stackTrace');
    return result;
}

export function fromRpcTraceContext(traceContext: RpcTraceContext): TraceContext {
    const result: TraceContext = {};
    copyPropIfDefined(traceContext, result, 'traceParent');
    copyPropIfDefined(traceContext, result, 'traceState');
    if (traceContext.attributes) {
        result.attributes = traceContext.attributes;
    }
    return result;
}

export function toRpcTypedData(data: unknown): RpcTypedData | null | undefined {
    if (data === null || data === undefined) {
        return data;
    } else if (typeof data === 'string') {
        return { string: data };
    } else if (Buffer.isBuffer(data)) {
        return { bytes: data };
    } else if (ArrayBuffer.isView(data)) {
        const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        return { bytes: bytes };
    } else if (typeof data === 'number') {
        if (Number.isInteger(data)) {
            return { int: data };
        } else {
            return { double: data };
        }
    } else {
        return { json: JSON.stringify(data) };
    }
}

/**
 * Converts boolean input to an 'INullableBool' to be sent through the RPC layer.
 * Input that is not a boolean but is also not null or undefined logs a function app level warning.
 * @param nullable Input to be converted to an INullableBool if it is a valid boolean
 * @param propertyName The name of the property that the caller will assign the output to. Used for debugging.
 */
export function toNullableBool(nullable: boolean | undefined, propertyName: string): undefined | RpcNullableBool {
    if (typeof nullable === 'boolean') {
        return <RpcNullableBool>{
            value: nullable,
        };
    }

    if (nullable != null) {
        throw new InternalException(
            `A 'boolean' type was expected instead of a '${typeof nullable}' type. Cannot parse value of '${propertyName}'.`
        );
    }

    return undefined;
}

/**
 * Converts number or string that parses to a number to an 'INullableDouble' to be sent through the RPC layer.
 * Input that is not a valid number but is also not null or undefined logs a function app level warning.
 * @param nullable Input to be converted to an INullableDouble if it is a valid number
 * @param propertyName The name of the property that the caller will assign the output to. Used for debugging.
 */
export function toNullableDouble(
    nullable: number | string | undefined,
    propertyName: string
): undefined | RpcNullableDouble {
    if (typeof nullable === 'number') {
        return <RpcNullableDouble>{
            value: nullable,
        };
    } else if (typeof nullable === 'string') {
        if (!isNaN(<any>nullable)) {
            const parsedNumber = parseFloat(nullable);
            return <RpcNullableDouble>{
                value: parsedNumber,
            };
        }
    }

    if (nullable != null) {
        throw new InternalException(
            `A 'number' type was expected instead of a '${typeof nullable}' type. Cannot parse value of '${propertyName}'.`
        );
    }

    return undefined;
}

/**
 * Converts string input to an 'INullableString' to be sent through the RPC layer.
 * Input that is not a string but is also not null or undefined logs a function app level warning.
 * @param nullable Input to be converted to an INullableString if it is a valid string
 * @param propertyName The name of the property that the caller will assign the output to. Used for debugging.
 */
export function toRpcString(nullable: string | undefined, propertyName: string): string {
    if (typeof nullable === 'string') {
        return nullable;
    }

    if (nullable != null) {
        throw new InternalException(
            `A 'string' type was expected instead of a '${typeof nullable}' type. Cannot parse value of '${propertyName}'.`
        );
    }

    return '';
}

/**
 * Converts string input to an 'INullableString' to be sent through the RPC layer.
 * Input that is not a string but is also not null or undefined logs a function app level warning.
 * @param nullable Input to be converted to an INullableString if it is a valid string
 * @param propertyName The name of the property that the caller will assign the output to. Used for debugging.
 */
export function toNullableString(nullable: string | undefined, propertyName: string): undefined | RpcNullableString {
    if (typeof nullable === 'string') {
        return <RpcNullableString>{
            value: nullable,
        };
    }

    if (nullable != null) {
        throw new InternalException(
            `A 'string' type was expected instead of a '${typeof nullable}' type. Cannot parse value of '${propertyName}'.`
        );
    }

    return undefined;
}

/**
 * Converts Date or number input to an 'INullableTimestamp' to be sent through the RPC layer.
 * Input that is not a Date or number but is also not null or undefined logs a function app level warning.
 * @param nullable Input to be converted to an INullableTimestamp if it is valid input
 * @param propertyName The name of the property that the caller will assign the output to. Used for debugging.
 */
export function toNullableTimestamp(
    dateTime: Date | number | undefined,
    propertyName: string
): RpcNullableTimestamp | undefined {
    if (dateTime != null) {
        try {
            const timeInMilliseconds = typeof dateTime === 'number' ? dateTime : dateTime.getTime();

            if (timeInMilliseconds && timeInMilliseconds >= 0) {
                return {
                    value: {
                        seconds: Math.round(timeInMilliseconds / 1000),
                    },
                };
            }
        } catch {
            throw new InternalException(
                `A 'number' or 'Date' input was expected instead of a '${typeof dateTime}'. Cannot parse value of '${propertyName}'.`
            );
        }
    }
    return undefined;
}
