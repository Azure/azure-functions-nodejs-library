// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    CosmosDBFunctionOptions,
    EventGridFunctionOptions,
    EventHubFunctionOptions,
    FunctionTrigger,
    GenericFunctionOptions,
    HttpFunctionOptions,
    HttpHandler,
    HttpMethod,
    HttpMethodFunctionOptions,
    McpToolFunctionOptions,
    MySqlFunctionOptions,
    ServiceBusQueueFunctionOptions,
    ServiceBusTopicFunctionOptions,
    SqlFunctionOptions,
    StorageBlobFunctionOptions,
    StorageQueueFunctionOptions,
    TimerFunctionOptions,
    WarmupFunctionOptions,
    WebPubSubFunctionOptions,
} from '@azure/functions';
import { FunctionCallback } from '@azure/functions-core';
import { toCoreFunctionMetadata } from './converters/toCoreFunctionMetadata';
import * as output from './output';
import { ProgrammingModel } from './ProgrammingModel';
import * as trigger from './trigger';
import { tryGetCoreApiLazy } from './utils/tryGetCoreApiLazy';

export * as hook from './hooks/registerHook';
export { setup } from './setup';

let hasSetModel = false;
function setProgrammingModel() {
    const coreApi = tryGetCoreApiLazy();
    if (!coreApi) {
        console.warn(
            'WARNING: Failed to detect the Azure Functions runtime. Switching "@azure/functions" package to test mode - not all features are supported.'
        );
    } else {
        coreApi.setProgrammingModel(new ProgrammingModel());
    }
    hasSetModel = true;
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

function convertToGenericOptions<T extends Omit<GenericFunctionOptions, 'trigger'> & Partial<GenericFunctionOptions>>(
    options: T,
    triggerMethod: (
        o: Omit<T, 'handler' | 'return' | 'trigger' | 'extraInputs' | 'extraOutputs' | 'retry'>
    ) => FunctionTrigger
): GenericFunctionOptions {
    const { handler, return: ret, trigger, extraInputs, extraOutputs, retry, ...triggerOptions } = options;
    return {
        trigger: trigger ?? triggerMethod(triggerOptions),
        return: ret,
        retry,
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

export function warmup(name: string, options: WarmupFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.warmup));
}

export function sql(name: string, options: SqlFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.sql));
}

export function mySql(name: string, options: MySqlFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.mySql));
}

export function webPubSub(name: string, options: WebPubSubFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.webPubSub));
}

/**
 * Registers an MCP Tool function in your app.
 * This function is triggered by MCP Tool events and allows you to define the behavior of the function.
 *
 * @param name - The name of the function. This must be unique within your app and is primarily used for tracking purposes.
 * @param options - Configuration options for the MCP Tool function, including the handler and trigger-specific settings.
 */
export function mcpTool(name: string, options: McpToolFunctionOptions): void {
    generic(name, convertToGenericOptions(options, trigger.mcpTool));
}

export function generic(name: string, options: GenericFunctionOptions): void {
    if (!hasSetModel) {
        setProgrammingModel();
    }

    const coreApi = tryGetCoreApiLazy();
    if (!coreApi) {
        console.warn(
            `WARNING: Skipping call to register function "${name}" because the "@azure/functions" package is in test mode.`
        );
    } else {
        coreApi.registerFunction(toCoreFunctionMetadata(name, options), <FunctionCallback>options.handler);
    }
}
