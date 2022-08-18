// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as coreTypes from '@azure/functions-core';
import { CoreInvocationContext, setProgrammingModel } from '@azure/functions-core';
import { version } from './constants';
import { InvocationModel } from './InvocationModel';

class ProgrammingModel implements coreTypes.ProgrammingModel {
    name = '@azure/functions';
    version = version;
    getInvocationModel(coreCtx: CoreInvocationContext): InvocationModel {
        return new InvocationModel(coreCtx);
    }
}

export function setup() {
    setProgrammingModel(new ProgrammingModel());
}
