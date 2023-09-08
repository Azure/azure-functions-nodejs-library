// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    CosmosDBFunctionOptions,
    EventGridFunctionOptions,
    EventHubFunctionOptions,
    ExponentialBackoffRetryOptions,
    FixedDelayRetryOptions,
    FunctionOptions,
    FunctionTrigger,
    GenericFunctionOptions,
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
import { toRpcDuration } from './converters/toRpcDuration';
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

function convertToGenericOptions<T extends Omit<FunctionOptions, 'trigger'> & Partial<FunctionOptions>>(
    options: T,
    triggerMethod: (o: Omit<T, 'handler' | 'return' | 'trigger' | 'extraInputs' | 'extraOutputs'>) => FunctionTrigger
): FunctionOptions {
    const { handler, return: ret, trigger, extraInputs, extraOutputs, ...triggerOptions } = options;
    return {
        trigger: trigger ?? triggerMethod(triggerOptions),
        return: ret,
        extraInputs,
        extraOutputs,
        handler,
    };
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
    generic(name, convertToGenericOptions(options, trigger.http));
}

export function timer(name: string, options: TimerFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.timer));
}

export function storageBlob(name: string, options: StorageBlobFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.storageBlob));
}

export function storageQueue(name: string, options: StorageQueueFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.storageQueue));
}

export function serviceBusQueue(name: string, options: ServiceBusQueueFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.serviceBusQueue));
}

export function serviceBusTopic(name: string, options: ServiceBusTopicFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.serviceBusTopic));
}

export function eventHub(name: string, options: EventHubFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.eventHub));
}

export function eventGrid(name: string, options: EventGridFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.eventGrid));
}

export function cosmosDB(name: string, options: CosmosDBFunctionOptions): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    generic(name, convertToGenericOptions(options, <any>trigger.cosmosDB));
}

export function generic(name: string, options: GenericFunctionOptions): void {
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

    const coreApi = tryGetCoreApiLazy();
    if (!coreApi) {
        console.warn(
            `WARNING: Skipping call to register function "${name}" because the "@azure/functions" package is in test mode.`
        );
    } else {
        coreApi.registerFunction({ name, bindings, retryOptions }, <FunctionCallback>options.handler);
    }
}
