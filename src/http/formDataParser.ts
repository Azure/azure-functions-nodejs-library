// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Readable } from 'node:stream';
import { Busboy } from '@fastify/busboy';
import { ReadableStream } from 'stream/web';
import { FormData, Headers } from 'undici';

/**
 * Parse form data from a ReadableStream using @fastify/busboy as recommended by undici
 * This replaces the deprecated formData() method from undici
 */
export async function parseFormData(body: ReadableStream<any> | null, headers: Headers): Promise<FormData> {
    if (!body) {
        throw new TypeError('Cannot parse form data from null body');
    }

    const contentType = headers.get('content-type');
    if (!contentType) {
        throw new TypeError('Content-Type header is required for form data parsing');
    }

    // Check if content type is supported
    const isMultipart = contentType.includes('multipart/form-data');
    const isUrlEncoded = contentType.includes('application/x-www-form-urlencoded');

    if (!isMultipart && !isUrlEncoded) {
        throw new TypeError(
            `Content-Type was not one of "multipart/form-data" or "application/x-www-form-urlencoded".`
        );
    }

    // For URL-encoded data, we can parse it directly
    if (isUrlEncoded) {
        const readable = Readable.fromWeb(body);
        const chunks: Buffer[] = [];

        for await (const chunk of readable) {
            if (Buffer.isBuffer(chunk)) {
                chunks.push(chunk);
            } else if (chunk instanceof Uint8Array) {
                chunks.push(Buffer.from(chunk));
            } else {
                chunks.push(Buffer.from(String(chunk)));
            }
        }

        const buffer = Buffer.concat(chunks);
        const text = buffer.toString('utf-8');
        const formData = new FormData();

        const params = new URLSearchParams(text);
        for (const [key, value] of params) {
            formData.append(key, value);
        }

        return formData;
    }

    // For multipart data, use busboy
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        const readable = Readable.fromWeb(body);

        const busboy = new Busboy({
            headers: { 'content-type': contentType },
        });

        busboy.on('field', (fieldname, value) => {
            formData.append(fieldname, value);
        });

        busboy.on('file', (fieldname, fileStream, filename, encoding, mimeType) => {
            const chunks: Uint8Array[] = [];

            fileStream.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });

            fileStream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const file = new File([buffer], filename || 'unknown', {
                    type: mimeType || 'application/octet-stream',
                });
                formData.append(fieldname, file);
            });

            fileStream.on('error', reject);
        });

        busboy.on('error', reject);

        busboy.on('finish', () => {
            resolve(formData);
        });

        readable.pipe(busboy);
    });
}
