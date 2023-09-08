// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger, RetryOptions } from './index';
import { InvocationContext } from './InvocationContext';

export type TimerHandler = (myTimer: Timer, context: InvocationContext) => FunctionResult;

export interface TimerFunctionOptions extends TimerTriggerOptions, Partial<FunctionOptions> {
    handler: TimerHandler;

    trigger?: TimerTrigger;

    /**
     * An optional retry policy to rerun a failed execution until either successful completion occurs or the maximum number of retries is reached.
     * Learn more [here](https://learn.microsoft.com/azure/azure-functions/functions-bindings-error-pages)
     */
    retry?: RetryOptions;
}

export interface TimerTriggerOptions {
    /**
     * A [cron expression](https://docs.microsoft.com/azure/azure-functions/functions-bindings-timer?pivots=programming-language-javascript#ncrontab-expressions) of the format '{second} {minute} {hour} {day} {month} {day of week}' to specify the schedule
     */
    schedule: string;

    /**
     * If `true`, the function is invoked when the runtime starts.
     * For example, the runtime starts when the function app wakes up after going idle due to inactivity, when the function app restarts due to function changes, and when the function app scales out.
     * _Use with caution_. runOnStartup should rarely if ever be set to `true`, especially in production.
     */
    runOnStartup?: boolean;

    /**
     * When true, schedule will be persisted to aid in maintaining the correct schedule even through restarts. Defaults to true for schedules with interval >= 1 minute
     */
    useMonitor?: boolean;
}

export type TimerTrigger = FunctionTrigger & TimerTriggerOptions;

/**
 * Timer schedule information. Provided to your function when using a timer binding.
 */
export interface Timer {
    /**
     * Whether this timer invocation is due to a missed schedule occurrence.
     */
    isPastDue: boolean;
    schedule: {
        /**
         * Whether intervals between invocations should account for DST.
         */
        adjustForDST: boolean;
    };
    scheduleStatus: {
        /**
         * The last recorded schedule occurrence. Date ISO string.
         */
        last: string;
        /**
         * The expected next schedule occurrence. Date ISO string.
         */
        next: string;
        /**
         * The last time this record was updated. This is used to re-calculate `next` with the current schedule after a host restart. Date ISO string.
         */
        lastUpdated: string;
    };
}
