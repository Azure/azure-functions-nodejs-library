// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger, RetryOptions } from './index';
import { InvocationContext } from './InvocationContext';

export type ConnectorTriggerHandler<T = unknown> = (triggerInput: T, context: InvocationContext) => FunctionResult;

export interface ConnectorTriggerFunctionOptions<T = unknown>
    extends ConnectorTriggerOptions,
        Partial<FunctionOptions> {
    handler: ConnectorTriggerHandler<T>;

    trigger?: ConnectorTrigger;

    /**
     * An optional retry policy to rerun a failed execution until either successful completion occurs or the maximum number of retries is reached.
     * Learn more [here](https://learn.microsoft.com/azure/azure-functions/functions-bindings-error-pages)
     */
    retry?: RetryOptions;
}

export interface ConnectorTriggerOptions extends Record<string, unknown> {}

export type ConnectorTrigger = FunctionTrigger & ConnectorTriggerOptions;
