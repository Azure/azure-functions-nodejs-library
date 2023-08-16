// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcNullableBool, RpcNullableDouble, RpcNullableString, RpcNullableTimestamp } from '@azure/functions-core';
import { AzFuncSystemError } from '../errors';
import { isDefined } from '../utils/nonNull';

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

    if (isDefined(nullable)) {
        throw new AzFuncSystemError(
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
        if (!isNaN(Number(nullable))) {
            const parsedNumber = parseFloat(nullable);
            return <RpcNullableDouble>{
                value: parsedNumber,
            };
        }
    }

    if (isDefined(nullable)) {
        throw new AzFuncSystemError(
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

    if (isDefined(nullable)) {
        throw new AzFuncSystemError(
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

    if (isDefined(nullable)) {
        throw new AzFuncSystemError(
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
    if (isDefined(dateTime)) {
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
            throw new AzFuncSystemError(
                `A 'number' or 'Date' input was expected instead of a '${typeof dateTime}'. Cannot parse value of '${propertyName}'.`
            );
        }
    }
    return undefined;
}
