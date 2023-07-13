// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    AppStartHandler,
    AppTerminateContext,
    AppTerminateHandler,
    CosmosDBFunctionOptions,
    CosmosDBTrigger,
    Disposable,
    EventGridFunctionOptions,
    EventHubFunctionOptions,
    FunctionOptions,
    HookFilter,
    HookHandler,
    HttpFunctionOptions,
    HttpHandler,
    HttpMethod,
    HttpMethodFunctionOptions,
    InvocationContext,
    PostInvocationHandler,
    PostInvocationOptions,
    PreInvocationHandler,
    PreInvocationOptions,
    RegisterResult,
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
import { AppStartContext } from './hooks/AppStartContext';
import { HookContext } from './hooks/HookContext';
import { PostInvocationContext } from './hooks/PostInvocationContext';
import { PreInvocationContext } from './hooks/PreInvocationContext';
import * as output from './output';
import * as trigger from './trigger';
import { isTrigger } from './utils/isTrigger';
import { isDefined } from './utils/nonNull';

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

export function get(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): RegisterResult {
    return http(name, convertToHttpOptions(optionsOrHandler, 'GET'));
}

export function put(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): RegisterResult {
    return http(name, convertToHttpOptions(optionsOrHandler, 'PUT'));
}

export function post(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): RegisterResult {
    return http(name, convertToHttpOptions(optionsOrHandler, 'POST'));
}

export function patch(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): RegisterResult {
    return http(name, convertToHttpOptions(optionsOrHandler, 'PATCH'));
}

export function deleteRequest(name: string, optionsOrHandler: HttpMethodFunctionOptions | HttpHandler): RegisterResult {
    return http(name, convertToHttpOptions(optionsOrHandler, 'DELETE'));
}

export function http(name: string, options: HttpFunctionOptions): RegisterResult {
    options.return ||= output.http({});
    return generic(name, {
        trigger: trigger.http({
            authLevel: options.authLevel,
            methods: options.methods,
            route: options.route,
        }),
        ...options,
    });
}

export function timer(name: string, options: TimerFunctionOptions): RegisterResult {
    return generic(name, {
        trigger: trigger.timer({
            schedule: options.schedule,
            runOnStartup: options.runOnStartup,
            useMonitor: options.useMonitor,
        }),
        ...options,
    });
}

export function storageBlob(name: string, options: StorageBlobFunctionOptions): RegisterResult {
    return generic(name, {
        trigger: trigger.storageBlob({
            connection: options.connection,
            path: options.path,
        }),
        ...options,
    });
}

export function storageQueue(name: string, options: StorageQueueFunctionOptions): RegisterResult {
    return generic(name, {
        trigger: trigger.storageQueue({
            connection: options.connection,
            queueName: options.queueName,
        }),
        ...options,
    });
}

export function serviceBusQueue(name: string, options: ServiceBusQueueFunctionOptions): RegisterResult {
    return generic(name, {
        trigger: trigger.serviceBusQueue({
            connection: options.connection,
            queueName: options.queueName,
            isSessionsEnabled: options.isSessionsEnabled,
        }),
        ...options,
    });
}

export function serviceBusTopic(name: string, options: ServiceBusTopicFunctionOptions): RegisterResult {
    return generic(name, {
        trigger: trigger.serviceBusTopic({
            connection: options.connection,
            topicName: options.topicName,
            subscriptionName: options.subscriptionName,
            isSessionsEnabled: options.isSessionsEnabled,
        }),
        ...options,
    });
}

export function eventHub(name: string, options: EventHubFunctionOptions): RegisterResult {
    return generic(name, {
        trigger: trigger.eventHub({
            connection: options.connection,
            eventHubName: options.eventHubName,
            cardinality: options.cardinality,
            consumerGroup: options.consumerGroup,
        }),
        ...options,
    });
}

export function eventGrid(name: string, options: EventGridFunctionOptions): RegisterResult {
    return generic(name, {
        trigger: trigger.eventGrid({}),
        ...options,
    });
}

export function cosmosDB(name: string, options: CosmosDBFunctionOptions): RegisterResult {
    let cosmosTrigger: CosmosDBTrigger;
    if ('connectionStringSetting' in options) {
        cosmosTrigger = trigger.cosmosDB({
            checkpointDocumentCount: options.checkpointDocumentCount,
            checkpointInterval: options.checkpointInterval,
            collectionName: options.collectionName,
            connectionStringSetting: options.connectionStringSetting,
            createLeaseCollectionIfNotExists: options.createLeaseCollectionIfNotExists,
            databaseName: options.databaseName,
            feedPollDelay: options.feedPollDelay,
            id: options.id,
            leaseAcquireInterval: options.leaseAcquireInterval,
            leaseCollectionName: options.leaseCollectionName,
            leaseCollectionPrefix: options.leaseCollectionPrefix,
            leaseCollectionThroughput: options.leaseCollectionThroughput,
            leaseConnectionStringSetting: options.leaseConnectionStringSetting,
            leaseDatabaseName: options.leaseDatabaseName,
            leaseExpirationInterval: options.leaseExpirationInterval,
            leaseRenewInterval: options.leaseRenewInterval,
            maxItemsPerInvocation: options.maxItemsPerInvocation,
            partitionKey: options.partitionKey,
            preferredLocations: options.preferredLocations,
            sqlQuery: options.sqlQuery,
            startFromBeginning: options.startFromBeginning,
            useMultipleWriteLocations: options.useMultipleWriteLocations,
        });
    } else {
        cosmosTrigger = trigger.cosmosDB({
            connection: options.connection,
            containerName: options.containerName,
            createLeaseContainerIfNotExists: options.createLeaseContainerIfNotExists,
            databaseName: options.databaseName,
            feedPollDelay: options.feedPollDelay,
            id: options.id,
            leaseAcquireInterval: options.leaseAcquireInterval,
            leaseConnection: options.leaseConnection,
            leaseContainerName: options.leaseContainerName,
            leaseContainerPrefix: options.leaseContainerPrefix,
            leaseDatabaseName: options.leaseDatabaseName,
            leaseExpirationInterval: options.leaseExpirationInterval,
            leaseRenewInterval: options.leaseRenewInterval,
            leasesContainerThroughput: options.leasesContainerThroughput,
            maxItemsPerInvocation: options.maxItemsPerInvocation,
            partitionKey: options.partitionKey,
            preferredLocations: options.preferredLocations,
            sqlQuery: options.sqlQuery,
            startFromBeginning: options.startFromBeginning,
            startFromTime: options.startFromTime,
        });
    }
    return generic(name, {
        trigger: cosmosTrigger,
        ...options,
    });
}

export function generic(name: string, options: FunctionOptions): RegisterResult {
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

    const result: RegisterResult = {
        onPreInvocation(handler: PreInvocationHandler): RegisterResult {
            onPreInvocation({
                filter: name,
                handler,
            });
            return this;
        },

        onPostInvocation(handler: PostInvocationHandler): RegisterResult {
            onPostInvocation({
                filter: name,
                handler,
            });
            return this;
        },
    };

    return result;
}

function coreRegisterHook(hookName: string, callback: coreTypes.HookCallback): coreTypes.Disposable {
    const coreApi = tryGetCoreApiLazy();
    if (!coreApi) {
        console.error(
            `WARNING: Skipping call to register ${hookName} hook because the "@azure/functions" package is in test mode.`
        );
        return new Disposable(() => {
            console.log(
                `WARNING: Skipping call to dispose ${hookName} hook because the "@azure/functions" package is in test mode.`
            );
        });
    } else {
        return coreApi.registerHook(hookName, callback);
    }
}

export function on(hookName: string, handler: HookHandler): Disposable {
    switch (hookName) {
        case 'appStart':
            return onStart(handler as AppStartHandler);
        case 'appTerminate':
            return onTerminate(handler as AppTerminateHandler);
        case 'preInvocation':
            return onPreInvocation(handler as PreInvocationHandler);
        case 'postInvocation':
            return onPostInvocation(handler as PostInvocationHandler);
        default: {
            const coreCallback: coreTypes.HookCallback = (coreContext: coreTypes.HookContext) => {
                const context = new HookContext(coreContext);
                return handler(context);
            };
            return coreRegisterHook(hookName, coreCallback);
        }
    }
}

export function onStart(handler: AppStartHandler): Disposable {
    const coreCallback: coreTypes.AppStartCallback = (coreContext: coreTypes.AppStartContext) => {
        const context = new AppStartContext(coreContext);
        return handler(context);
    };
    return coreRegisterHook('appStart', coreCallback as coreTypes.HookCallback);
}

export function onTerminate(handler: AppTerminateHandler): Disposable {
    const coreCallback: coreTypes.AppTerminateCallback = (coreContext: coreTypes.AppTerminateContext) => {
        const context = new AppTerminateContext(coreContext);
        return handler(context);
    };
    return coreRegisterHook('appTerminate', coreCallback as coreTypes.HookCallback);
}

export function onPreInvocation(handlerOrOptions: PreInvocationHandler | PreInvocationOptions): Disposable {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrOptions.handler;
    const filter: HookFilter | HookFilter[] | undefined =
        typeof handlerOrOptions === 'function' ? [] : handlerOrOptions.filter;

    const coreCallback: coreTypes.PreInvocationCallback = (coreContext: coreTypes.PreInvocationContext) => {
        const invocationContext = coreContext.invocationContext as InvocationContext;
        if (!isDefined(filter) || shouldRunHook(invocationContext, filter)) {
            const preInvocContext = new PreInvocationContext({
                ...coreContext,
                functionHandler: coreContext.functionCallback,
                args: coreContext.inputs,
                invocationContext,
                coreContext,
            });
            return handler(preInvocContext);
        }
    };
    return coreRegisterHook('preInvocation', coreCallback as coreTypes.HookCallback);
}

export function onPostInvocation(handlerOrOptions: PostInvocationHandler | PostInvocationOptions): Disposable {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrOptions.handler;
    const filter: HookFilter | HookFilter[] | undefined =
        typeof handlerOrOptions === 'function' ? [] : handlerOrOptions.filter;

    const coreCallback: coreTypes.PostInvocationCallback = (coreContext: coreTypes.PostInvocationContext) => {
        const invocationContext = coreContext.invocationContext as InvocationContext;
        if (!isDefined(filter) || shouldRunHook(invocationContext, filter)) {
            const postInvocContext = new PostInvocationContext({
                ...coreContext,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                result: coreContext.result,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                errorResult: coreContext.error,
                args: coreContext.inputs,
                invocationContext,
                coreContext,
            });
            return handler(postInvocContext);
        }
    };
    return coreRegisterHook('postInvocation', coreCallback as coreTypes.HookCallback);
}

export function shouldRunHook(invocationContext: InvocationContext, filter: HookFilter | HookFilter[]): boolean {
    if (Array.isArray(filter)) {
        return filter.every((f) => shouldRunHook(invocationContext, f));
    } else if (typeof filter === 'object') {
        const filters: boolean[] = [];
        if (filter.functionNames) {
            filters.push(filter.functionNames.includes(invocationContext.functionName));
        }
        if (filter.triggerTypes) {
            filters.push(filter.triggerTypes.includes(invocationContext.options.trigger.type));
        }
        if (filter.invocationIds) {
            filters.push(filter.invocationIds.includes(invocationContext.invocationId));
        }
        return filters.some((f) => f);
    } else if (typeof filter === 'string') {
        return invocationContext.functionName === filter;
    } else {
        return filter(invocationContext);
    }
}
