// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as coreTypes from '@azure/functions-core';
import { CoreInvocationContext, WorkerCapabilities } from '@azure/functions-core';
import { version } from './constants';
import { setupHttpProxy } from './http/httpProxy';
import { InvocationModel } from './InvocationModel';
import { capabilities as libraryCapabilities, enableHttpStream, lockSetup } from './setup';

export class ProgrammingModel implements coreTypes.ProgrammingModel {
    name = '@azure/functions';
    version = version;

    getInvocationModel(coreCtx: CoreInvocationContext): InvocationModel {
        return new InvocationModel(coreCtx);
    }

    async getCapabilities(workerCapabilities: WorkerCapabilities): Promise<WorkerCapabilities> {
        lockSetup();

        if (enableHttpStream) {
            const httpUri = await setupHttpProxy();
            workerCapabilities.HttpUri = httpUri;
        }

        Object.assign(workerCapabilities, libraryCapabilities);

        return workerCapabilities;
    }
}
