// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

export { HttpRequest } from './http/HttpRequest';
export { HttpResponse } from './http/HttpResponse';
export { InvocationContext } from './InvocationContext';

const bindingCounts: Record<string, number> = {};
/**
 * If the host spawns multiple workers, it expects the metadata (including binding name) to be the same accross workers
 * That means we need to generate binding names in a deterministic fashion, so we'll do that using a count
 * There's a tiny risk users register bindings in a non-deterministic order (i.e. async race conditions), but it's okay considering the following:
 * 1. We will track the count individually for each binding type. This makes the names more readable and reduces the chances a race condition will matter
 * 2. Users can manually specify the name themselves (aka if they're doing weird async stuff) and we will respect that
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
        let count = bindingCounts[bindingType] || 0;
        count += 1;
        bindingCounts[bindingType] = count;
        binding.name = bindingType + count.toString();
    }
    return <T & { name: string }>binding;
}
