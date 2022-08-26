// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FormData } from 'undici';
import { MediaType } from '../constants';
import { AzFuncSystemError } from '../errors';
import { parseContentType } from './parseHeader';
import { parseMultipartForm } from './parseMultipartForm';

/**
 * See ./test/parseForm.test.ts for examples
 */
export function parseForm(data: Buffer | string, contentType: string): FormData {
    const [mediaType, parameters] = parseContentType(contentType);
    switch (mediaType.toLowerCase()) {
        case MediaType.multipartForm: {
            const boundary = parameters.get('boundary');
            return parseMultipartForm(typeof data === 'string' ? Buffer.from(data) : data, boundary);
        }
        case MediaType.urlEncodedForm: {
            const parsed = new URLSearchParams(data.toString());
            const result = new FormData();
            for (const [key, value] of parsed) {
                result.append(key, value);
            }
            return result;
        }
        default:
            throw new AzFuncSystemError(
                `Media type "${mediaType}" does not match types supported for form parsing: "${MediaType.multipartForm}", "${MediaType.urlEncodedForm}".`
            );
    }
}
