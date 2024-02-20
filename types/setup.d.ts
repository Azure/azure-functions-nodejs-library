// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

export interface SetupOptions {
    /**
     * PREVIEW: Stream http requests and responses instead of loading entire body in memory.
     * [Learn more here](https://aka.ms/AzFuncNodeHttpStreams)
     */
    enableHttpStream?: boolean;
}
