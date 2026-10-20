// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

export interface SetupOptions {
    /** Copy flat properties from the final plain-object log argument into log hook attributes. Disabled by default. */
    structuredLogProperties?: 'lastPlainObject';

    /**
     * Stream http requests and responses instead of loading entire body in memory.
     * [Learn more here](https://aka.ms/AzFuncNodeHttpStreams)
     */
    enableHttpStream?: boolean;

    /**
     * Dictionary of Node.js worker capabilities.
     * This will be merged with existing capabilities specified by the Node.js worker and library.
     */
    capabilities?: Record<string, string | boolean>;
}
