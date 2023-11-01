// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as types from '@azure/functions';
import { HookContext } from './HookContext';

export class AppStartContext extends HookContext implements types.AppStartContext {}
