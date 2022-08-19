// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

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
