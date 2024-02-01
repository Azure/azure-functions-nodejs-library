// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as coreTypes from '@azure/functions-core';
import { CoreInvocationContext, WorkerCapabilities } from '@azure/functions-core';
import { version } from './constants';
import { setupHttpProxy } from './http/httpProxy';
import { InvocationModel } from './InvocationModel';
import { isHttpStreamEnabled, lockSetup } from './setup';

export class ProgrammingModel implements coreTypes.ProgrammingModel {
    name = '@azure/functions';
    version = version;

    getInvocationModel(coreCtx: CoreInvocationContext): InvocationModel {
        return new InvocationModel(coreCtx);
    }

    async getCapabilities(capabilities: WorkerCapabilities): Promise<WorkerCapabilities> {
        lockSetup();

        if (isHttpStreamEnabled()) {
            const httpUri = await setupHttpProxy();
            capabilities.HttpUri = httpUri;
        }

        return capabilities;
    }
}
