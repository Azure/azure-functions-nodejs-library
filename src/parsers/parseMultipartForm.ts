// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Blob } from 'buffer';
import { FormData } from 'undici';
import { HeaderName } from '../constants';
import { getHeaderValue, parseContentDisposition } from './parseHeader';

const carriageReturn = Buffer.from('\r')[0];
const newline = Buffer.from('\n')[0];

// multipart/form-data specification https://datatracker.ietf.org/doc/html/rfc7578
export function parseMultipartForm(chunk: Buffer, boundary: string): FormData {
    const result = new FormData();
    let currentName: string | undefined;
    let currentFileName: string | undefined;
    let currentContentType: string | undefined;

    let inHeaders = false;

    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const endBoundaryBuffer = Buffer.from(`--${boundary}--`);

    let lineStart = 0;
    let lineEnd = 0;
    let partValueStart = 0;
    let partValueEnd = 0;

    for (let index = 0; index < chunk.length; index++) {
        let line: Buffer;
        if (chunk[index] === newline) {
            lineEnd = chunk[index - 1] === carriageReturn ? index - 1 : index;
            line = chunk.subarray(lineStart, lineEnd);
            lineStart = index + 1;
        } else {
            continue;
        }

        const isBoundary = line.equals(boundaryBuffer);
        const isBoundaryEnd = line.equals(endBoundaryBuffer);
        if (isBoundary || isBoundaryEnd) {
            if (currentName) {
                const value = chunk.subarray(partValueStart, partValueEnd);
                if (currentFileName) {
                    result.append(currentName, new Blob([value], { type: currentContentType }), currentFileName);
                } else {
                    result.append(currentName, value.toString());
                }
            }

            if (isBoundaryEnd) {
                break;
            }

            currentName = undefined;
            currentFileName = undefined;
            currentContentType = undefined;
            inHeaders = true;
        } else if (inHeaders) {
            const lineAsString = line.toString();
            if (!lineAsString) {
                // A blank line means we're done with the headers for this part
                inHeaders = false;
                if (!currentName) {
                    throw new Error(
                        `Expected part to have header "${HeaderName.contentDisposition}" with parameter "name".`
                    );
                } else {
                    partValueStart = lineStart;
                    partValueEnd = lineStart;
                }
            } else {
                const contentDisposition = getHeaderValue(lineAsString, HeaderName.contentDisposition);
                if (contentDisposition) {
                    const [, dispositionParts] = parseContentDisposition(contentDisposition);
                    currentName = dispositionParts.get('name');

                    // filename is optional, even for files
                    if (dispositionParts.has('fileName')) {
                        currentFileName = dispositionParts.get('fileName');
                    }
                } else {
                    const contentType = getHeaderValue(lineAsString, HeaderName.contentType);
                    if (contentType) {
                        currentContentType = contentType;
                    }
                }
            }
        } else {
            partValueEnd = lineEnd;
        }
    }

    return result;
}
