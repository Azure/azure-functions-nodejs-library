// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { CoreInvocationContext, InvocationModel, ProgrammingModel, setProgrammingModel } from '@azure/functions-core';
import { version } from './constants';
import { V3InvocationModel } from './V3InvocationModel';

class V3ProgrammingModel implements ProgrammingModel {
    name = 'defaultV3';
    version = version;
    getInvocationModel(coreCtx: CoreInvocationContext): InvocationModel {
        return new V3InvocationModel(coreCtx);
    }
}

export function setup() {
    setProgrammingModel(new V3ProgrammingModel());
}
