// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Exception, RetryContext, TraceContext } from '@azure/functions';
import { RpcException, RpcRetryContext, RpcTraceContext } from '@azure/functions-core';
import { copyPropIfDefined, nonNullProp } from '../utils/nonNull';

export function fromRpcRetryContext(retryContext: RpcRetryContext | null | undefined): RetryContext | undefined {
    if (!retryContext) {
        return undefined;
    } else {
        const result: RetryContext = {
            retryCount: nonNullProp(retryContext, 'retryCount'),
            maxRetryCount: nonNullProp(retryContext, 'maxRetryCount'),
        };
        if (retryContext.exception) {
            result.exception = fromRpcException(retryContext.exception);
        }
        return result;
    }
}

function fromRpcException(exception: RpcException): Exception {
    const result: Exception = {};
    copyPropIfDefined(exception, result, 'message');
    copyPropIfDefined(exception, result, 'source');
    copyPropIfDefined(exception, result, 'stackTrace');
    return result;
}

export function fromRpcTraceContext(traceContext: RpcTraceContext | null | undefined): TraceContext | undefined {
    if (!traceContext) {
        return undefined;
    } else {
        const result: TraceContext = {};
        copyPropIfDefined(traceContext, result, 'traceParent');
        copyPropIfDefined(traceContext, result, 'traceState');
        if (traceContext.attributes) {
            result.attributes = traceContext.attributes;
        }
        return result;
    }
}
