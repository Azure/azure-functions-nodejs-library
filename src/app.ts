// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    CosmosDBFunctionOptions,
    EventGridFunctionOptions,
    EventHubFunctionOptions,
    FunctionOptions,
    FunctionTrigger,
    HttpFunctionOptions,
    HttpHandler,
    HttpMethod,
    HttpMethodFunctionOptions,
    ServiceBusQueueFunctionOptions,
    ServiceBusTopicFunctionOptions,
    StorageBlobFunctionOptions,
    StorageQueueFunctionOptions,
    TimerFunctionOptions,
} from '@azure/functions';
import * as coreTypes from '@azure/functions-core';
import { CoreInvocationContext, FunctionCallback } from '@azure/functions-core';
import { InvocationModel } from './InvocationModel';
import { returnBindingKey, version } from './constants';
import * as output from './output';
import * as trigger from './trigger';
import { isTrigger } from './utils/isTrigger';

let coreApi: typeof coreTypes | undefined | null;
function tryGetCoreApiLazy(): typeof coreTypes | null {
    if (coreApi === undefined) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            coreApi = <typeof coreTypes>require('@azure/functions-core');
        } catch {
            coreApi = null;
        }
    }
    return coreApi;
}

class ProgrammingModel implements coreTypes.ProgrammingModel {
    name = '@azure/functions';
    version = version;
    getInvocationModel(coreCtx: CoreInvocationContext): InvocationModel {
        return new InvocationModel(coreCtx);
    }
}

let hasSetup = false;
function setup() {
    const coreApi = tryGetCoreApiLazy();
    if (!coreApi) {
        console.warn(
            'WARNING: Failed to detect the Azure Functions runtime. Switching "@azure/functions" package to test mode - not all features are supported.'
        );
    } else {
        coreApi.setProgrammingModel(new ProgrammingModel());
    }
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

export function get(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): void {
    http(name, convertToHttpOptions(optionsOrHandler, 'GET'));
}

export function put(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): void {
    http(name, convertToHttpOptions(optionsOrHandler, 'PUT'));
}

export function post(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): void {
    http(name, convertToHttpOptions(optionsOrHandler, 'POST'));
}

export function patch(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): void {
    http(name, convertToHttpOptions(optionsOrHandler, 'PATCH'));
}

export function deleteRequest(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): void {
    http(name, convertToHttpOptions(optionsOrHandler, 'DELETE'));
}

export function http(name: string, options: HttpFunctionOptions): void {
    options.return ||= output.http({});
    parseOptionsAndRegister(name, options, trigger.http);
}

export function timer(name: string, options: TimerFunctionOptions): void {
    parseOptionsAndRegister(name, options, trigger.timer);
}

export function storageBlob(name: string, options: StorageBlobFunctionOptions): void {
    parseOptionsAndRegister(name, options, trigger.storageBlob);
}

export function storageQueue(name: string, options: StorageQueueFunctionOptions): void {
    parseOptionsAndRegister(name, options, trigger.storageQueue);
}

export function serviceBusQueue(name: string, options: ServiceBusQueueFunctionOptions): void {
    parseOptionsAndRegister(name, options, trigger.serviceBusQueue);
}

export function serviceBusTopic(name: string, options: ServiceBusTopicFunctionOptions): void {
    parseOptionsAndRegister(name, options, trigger.serviceBusTopic);
}

export function eventHub(name: string, options: EventHubFunctionOptions): void {
    parseOptionsAndRegister(name, options, trigger.eventHub);
}

export function eventGrid(name: string, options: EventGridFunctionOptions): void {
    parseOptionsAndRegister(name, options, trigger.eventGrid);
}

export function cosmosDB(name: string, options: CosmosDBFunctionOptions): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    parseOptionsAndRegister(name, options, <any>trigger.cosmosDB);
}

function parseOptionsAndRegister<T extends Omit<FunctionOptions, 'trigger'> & Partial<FunctionOptions>>(
    name: string,
    options: T,
    triggerFunc: (o: Omit<T, 'handler' | 'return' | 'trigger' | 'extraInputs' | 'extraOutputs'>) => FunctionTrigger
): void {
    const { handler, return: ret, trigger: trig, extraInputs, extraOutputs, ...trigOptions } = options;
    generic(name, {
        trigger: trig ?? triggerFunc(trigOptions),
        return: ret,
        extraInputs,
        extraOutputs,
        handler,
    });
}

export function generic(name: string, options: FunctionOptions): void {
    if (!hasSetup) {
        setup();
    }

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
        options.return.name = returnBindingKey;
        bindings[options.return.name] = {
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

    const coreApi = tryGetCoreApiLazy();
    if (!coreApi) {
        console.warn(
            `WARNING: Skipping call to register function "${name}" because the "@azure/functions" package is in test mode.`
        );
    } else {
        coreApi.registerFunction({ name, bindings }, <FunctionCallback>options.handler);
    }
}
