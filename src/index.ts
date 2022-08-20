// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    FunctionInput,
    FunctionOptions,
    FunctionOutput,
    HttpFunctionOptions,
    HttpHandler,
    HttpInput,
    HttpInputOptions,
    HttpMethod,
    HttpOutput,
    HttpOutputOptions,
    StorageBlobFunctionOptions,
    StorageBlobInput,
    StorageBlobInputOptions,
    StorageBlobOutput,
    StorageBlobOutputOptions,
    StorageQueueFunctionOptions,
    StorageQueueInput,
    StorageQueueInputOptions,
    StorageQueueOutput,
    StorageQueueOutputOptions,
    TimerFunctionOptions,
    TimerInput,
    TimerInputOptions,
} from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import {
    CoreInvocationContext,
    FunctionCallback,
    registerFunction,
    RpcBindingInfo,
    setProgrammingModel,
} from '@azure/functions-core';
import { returnBindingKey, version } from './constants';
import { InvocationModel } from './InvocationModel';
import { getRandomHexString } from './utils/getRandomHexString';

class ProgrammingModel implements coreTypes.ProgrammingModel {
    name = '@azure/functions';
    version = version;
    getInvocationModel(coreCtx: CoreInvocationContext): InvocationModel {
        return new InvocationModel(coreCtx);
    }
}

let hasSetup = false;
function setup() {
    setProgrammingModel(new ProgrammingModel());
    hasSetup = true;
}

function convertToHttpOptions(
    optionsOrHandler: HttpFunctionOptions | HttpHandler,
    method: HttpMethod
): HttpFunctionOptions {
    const options: HttpFunctionOptions =
        typeof optionsOrHandler === 'function' ? { handler: optionsOrHandler } : optionsOrHandler;
    options.methods = [method];
    return options;
}

export namespace app {
    export function get(name: string, optionsOrHandler: HttpFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'GET'));
    }

    export function put(name: string, optionsOrHandler: HttpFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'PUT'));
    }

    export function post(name: string, optionsOrHandler: HttpFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'POST'));
    }

    export function patch(name: string, optionsOrHandler: HttpFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'PATCH'));
    }

    export function deleteRequest(name: string, optionsOrHandler: HttpFunctionOptions | HttpHandler): void {
        http(name, convertToHttpOptions(optionsOrHandler, 'DELETE'));
    }

    export function http(name: string, options: HttpFunctionOptions): void {
        options.return ||= output.http({});
        generic(name, {
            ...options,
            trigger: input.http({
                authLevel: options.authLevel,
                methods: options.methods,
                route: options.route,
            }),
        });
    }

    export function timer(name: string, options: TimerFunctionOptions): void {
        generic(name, {
            ...options,
            trigger: input.timer({
                schedule: options.schedule,
                runOnStartup: options.runOnStartup,
                useMonitor: options.useMonitor,
            }),
        });
    }

    export function storageBlob(name: string, options: StorageBlobFunctionOptions): void {
        generic(name, {
            ...options,
            trigger: input.storageBlob({
                connection: options.connection,
                path: options.path,
            }),
        });
    }

    export function storageQueue(name: string, options: StorageQueueFunctionOptions): void {
        generic(name, {
            ...options,
            trigger: input.storageQueue({
                connection: options.connection,
                queueName: options.queueName,
            }),
        });
    }

    export function generic(name: string, options: FunctionOptions): void {
        if (!hasSetup) {
            setup();
        }

        const bindings = {};

        const trigger = options.trigger;
        bindings[trigger.name] = {
            ...trigger,
            direction: RpcBindingInfo.Direction.in,
            type: /trigger$/i.test(trigger.type) ? trigger.type : trigger.type + 'Trigger',
        };

        if (options.extraInputs) {
            for (const input of options.extraInputs) {
                bindings[input.name] = {
                    ...input,
                    direction: RpcBindingInfo.Direction.in,
                };
            }
        }

        if (options.return) {
            options.return.name = returnBindingKey;
            bindings[options.return.name] = {
                ...options.return,
                direction: RpcBindingInfo.Direction.out,
            };
        }

        if (options.extraOutputs) {
            for (const output of options.extraOutputs) {
                bindings[output.name] = {
                    ...output,
                    direction: RpcBindingInfo.Direction.out,
                };
            }
        }

        registerFunction({ name, bindings }, <FunctionCallback>options.handler);
    }
}

export namespace input {
    export function http(options: HttpInputOptions): HttpInput {
        return {
            ...options,
            authLevel: options.authLevel || 'anonymous',
            methods: options.methods || ['GET', 'POST'],
            name: getNewInputName(),
            type: 'http',
        };
    }

    export function timer(options: TimerInputOptions): TimerInput {
        return {
            ...options,
            name: getNewInputName(),
            type: 'timer',
        };
    }

    export function storageBlob(options: StorageBlobInputOptions): StorageBlobInput {
        return {
            ...options,
            name: getNewInputName(),
            type: 'blob',
        };
    }

    export function storageQueue(options: StorageQueueInputOptions): StorageQueueInput {
        return {
            ...options,
            name: getNewInputName(),
            type: 'queue',
        };
    }

    export function generic(type: string, options: {}): FunctionInput {
        return {
            ...options,
            name: getNewInputName(),
            type,
        };
    }
}

export namespace output {
    export function http(options: HttpOutputOptions): HttpOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type: 'http',
        };
    }

    export function storageBlob(options: StorageBlobOutputOptions): StorageBlobOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type: 'blob',
        };
    }

    export function storageQueue(options: StorageQueueOutputOptions): StorageQueueOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type: 'queue',
        };
    }

    export function generic(type: string, options: {}): FunctionOutput {
        return {
            ...options,
            name: getNewOutputName(),
            type,
        };
    }
}

function getNewInputName(): string {
    // it has to start with a letter and can't have special characters like hyphens
    return 'input' + getRandomHexString(10);
}

function getNewOutputName(): string {
    // it has to start with a letter and can't have special characters like hyphens
    return 'output' + getRandomHexString(10);
}
