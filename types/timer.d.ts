// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionInput, FunctionOptions, FunctionResult } from './index';
import { InvocationContext } from './InvocationContext';

export type TimerHandler = (context: InvocationContext, myTimer: Timer) => FunctionResult;

export interface TimerFunctionOptions extends TimerInputOptions, Partial<FunctionOptions> {
    handler: TimerHandler;
}

export interface TimerInputOptions {
    /**
     * A cron expression of the format '{second} {minute} {hour} {day} {month} {day of week}' to specify the schedule
     */
    schedule: string;

    /**
     * When true, your timer function will be invoked immediately after a runtime restart and on-schedule thereafter
     */
    runOnStartup?: boolean;

    /**
     * When true, schedule will be persisted to aid in maintaining the correct schedule even through restarts. Defaults to true for schedules with interval >= 1 minute
     */
    useMonitor?: boolean;
}

export type TimerInput = FunctionInput & TimerInputOptions;

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
