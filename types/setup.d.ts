// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

export interface SetupOptions {
    /**
     * PREVIEW: Stream http requests and responses instead of loading entire body in memory
     */
    enableHttpStream?: boolean;
}
