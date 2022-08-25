// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import {
    Form,
    HttpMethod,
    HttpRequest,
    HttpRequestHeaders,
    HttpRequestParams,
    HttpRequestQuery,
    HttpRequestUser,
} from '@azure/functions';
import { RpcHttpData, RpcTypedData } from '@azure/functions-core';
import { decode } from 'iconv-lite';
import { HeaderName, MediaType } from '../constants';
import { fromTypedData } from '../converters/RpcConverters';
import { fromNullableMapping, fromRpcHttpBody } from '../converters/RpcHttpConverters';
import { AzFuncSystemError } from '../errors';
import { parseForm } from '../parsers/parseForm';
import { extractHttpUserFromHeaders } from './extractHttpUserFromHeaders';

export class Request implements HttpRequest {
    method: HttpMethod | null;
    url: string;
    originalUrl: string;
    headers: HttpRequestHeaders;
    query: HttpRequestQuery;
    params: HttpRequestParams;
    body?: any;
    rawBody?: any;
    bufferBody?: Buffer;

    #cachedUser?: HttpRequestUser | null;

    constructor(rpcHttp: RpcHttpData) {
        this.method = <HttpMethod>rpcHttp.method;
        this.url = <string>rpcHttp.url;
        this.originalUrl = <string>rpcHttp.url;
        this.headers = fromNullableMapping(rpcHttp.nullableHeaders, rpcHttp.headers);
        this.query = fromNullableMapping(rpcHttp.nullableQuery, rpcHttp.query);
        this.params = fromNullableMapping(rpcHttp.nullableParams, rpcHttp.params);

        if (rpcHttp.body?.bytes) {
            this.bufferBody = Buffer.from(rpcHttp.body.bytes);
            // We turned on the worker capability to always receive bytes instead of a string (RawHttpBodyBytes) so that we could introduce the `bufferBody` property
            // However, we need to replicate the old host behavior for the `body` and `rawBody` properties so that we don't break anyone
            // https://github.com/Azure/azure-functions-nodejs-worker/issues/294
            // NOTE: The tests for this are in the e2e test folder of the worker. This is so we can test the full .net host behavior of encoding/parsing/etc.
            // https://github.com/Azure/azure-functions-nodejs-worker/blob/b109082f9b85b42af1de00db4192483460214d81/test/end-to-end/Azure.Functions.NodejsWorker.E2E/Azure.Functions.NodejsWorker.E2E/HttpEndToEndTests.cs

            const contentType = this.get(HeaderName.contentType)?.toLowerCase();
            let legacyBody: RpcTypedData | undefined | null;
            if (contentType === MediaType.octetStream || contentType?.startsWith(MediaType.multipartPrefix)) {
                // If the content type was octet or multipart, the host would leave the body as bytes
                // https://github.com/Azure/azure-functions-host/blob/9ac904e34b744d95a6f746921556235d4b2b3f0f/src/WebJobs.Script.Grpc/MessageExtensions/GrpcMessageConversionExtensions.cs#L233
                legacyBody = rpcHttp.body;
            } else {
                // Otherwise the host would decode the buffer to a string
                legacyBody = {
                    string: decodeBuffer(this.bufferBody),
                };
            }

            this.body = fromTypedData(legacyBody);
            this.rawBody = fromRpcHttpBody(legacyBody);
        }
    }

    get user(): HttpRequestUser | null {
        if (this.#cachedUser === undefined) {
            this.#cachedUser = extractHttpUserFromHeaders(this.headers);
        }

        return this.#cachedUser;
    }

    get(field: string): string | undefined {
        return this.headers && this.headers[field.toLowerCase()];
    }

    parseFormBody(): Form {
        const contentType = this.get(HeaderName.contentType);
        if (!contentType) {
            throw new AzFuncSystemError(`"${HeaderName.contentType}" header must be defined.`);
        } else {
            return parseForm(this.body, contentType);
        }
    }
}

/**
 * The host used utf8 by default, but supported `detectEncodingFromByteOrderMarks` so we have to replicate that
 * Host code: https://github.com/Azure/azure-webjobs-sdk-extensions/blob/03cb2ce82db74ed5a2f3299e8a84a6c35835c269/src/WebJobs.Extensions.Http/Extensions/HttpRequestExtensions.cs#L27
 * .NET code: https://github.com/dotnet/runtime/blob/e55c908229e36f99a52745d4ee85316a0e8bb6a2/src/libraries/System.Private.CoreLib/src/System/IO/StreamReader.cs#L469
 * .NET description of encoding preambles: https://docs.microsoft.com/en-us/dotnet/api/system.text.encoding.getpreamble?view=net-6.0#remarks
 **/
function decodeBuffer(buffer: Buffer): string | undefined {
    let encoding = 'utf8';
    if (buffer[0] === 0xfe && buffer[1] === 0xff) {
        encoding = 'utf16be'; // The same as `Encoding.BigEndianUnicode` in .NET
        buffer = compressBuffer(buffer, 2);
    } else if (buffer[0] === 0xff && buffer[1] === 0xfe) {
        if (buffer[2] !== 0 || buffer[3] !== 0) {
            encoding = 'utf16le'; // The same as `Encoding.Unicode` in .NET
            buffer = compressBuffer(buffer, 2);
        } else {
            encoding = 'utf32le';
            buffer = compressBuffer(buffer, 4);
        }
    } else if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
        encoding = 'utf8';
        buffer = compressBuffer(buffer, 3);
    } else if (buffer[0] === 0 && buffer[1] === 0 && buffer[2] === 0xfe && buffer[3] === 0xff) {
        encoding = 'utf32be';
        buffer = compressBuffer(buffer, 4);
    }

    // NOTE: Node.js doesn't support all the above encodings by default, so we have to use "iconv-lite" to help
    // Here are the iconv-lite supported encodings: https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings
    return decode(buffer, encoding);
}

function compressBuffer(buffer: Buffer, n: number): Buffer {
    return buffer.subarray(n);
}
