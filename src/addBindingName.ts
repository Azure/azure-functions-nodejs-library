// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { getStringHash } from './utils/getRandomHexString';

/**
 * If the host spawns multiple workers, it expects the metadata (including binding name) to be the same across workers.
 * That means we need to generate binding names in a deterministic fashion, so we'll do that using a string hash of the binding data
 * A few considerations:
 * 1. We will include the binding type in the name to make it more readable
 * 2. Users can manually specify the name themselves and we will respect that
 * 3. The only time the hash should cause a conflict is if a single function has duplicate bindings. Not sure why someone would do that, but we will throw an error at function registration time
 * More info here: https://github.com/Azure/azure-functions-nodejs-worker/issues/638
 */
export function addBindingName<T extends { type: string; name?: string }>(
    binding: T,
    suffix: string
): T & { name: string } {
    if (!binding.name) {
        let bindingType = binding.type;
        if (!bindingType.toLowerCase().endsWith(suffix.toLowerCase())) {
            bindingType += suffix;
        }
        binding.name = bindingType + getStringHash(JSON.stringify(binding));
    }
    return <T & { name: string }>binding;
}
