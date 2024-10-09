// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { EventEmitter } from 'events';
import * as http from 'http';
import { AzFuncSystemError, ensureErrorType } from '../errors';
import { nonNullProp } from '../utils/nonNull';
import { workerSystemLog } from '../utils/workerSystemLog';
import { HttpResponse } from './HttpResponse';

const requests: Record<string, http.IncomingMessage> = {};
const responses: Record<string, http.ServerResponse> = {};

const invocRequestEmitter = new EventEmitter();

export async function waitForProxyRequest(invocationId: string): Promise<http.IncomingMessage> {
    return new Promise((resolve, _reject) => {
        const req = requests[invocationId];
        if (req) {
            resolve(req);
            delete requests[invocationId];
        } else {
            invocRequestEmitter.once(invocationId, () => {
                const req = requests[invocationId];
                if (req) {
                    resolve(req);
                    delete requests[invocationId];
                }
            });
        }
    });
}

const invocationIdHeader = 'x-ms-invocation-id';
export async function sendProxyResponse(invocationId: string, userRes: HttpResponse): Promise<void> {
    const proxyRes = nonNullProp(responses, invocationId);
    delete responses[invocationId];
    for (const [key, val] of userRes.headers.entries()) {
        proxyRes.setHeader(key, val);
    }
    proxyRes.setHeader(invocationIdHeader, invocationId);
    proxyRes.statusCode = userRes.status;

    if (userRes.body) {
        for await (const chunk of userRes.body.values()) {
            proxyRes.write(chunk);
        }
    }
    proxyRes.end();
}

export async function setupHttpProxy(): Promise<string> {
    return new Promise((resolve, reject) => {
        const server = http.createServer();

        server.on('request', (req, res) => {
            const invocationId = req.headers[invocationIdHeader];
            if (typeof invocationId === 'string') {
                requests[invocationId] = req;
                responses[invocationId] = res;
                invocRequestEmitter.emit(invocationId);
            } else {
                workerSystemLog('error', `Http proxy request missing header ${invocationIdHeader}`);
            }
        });

        server.on('error', (err) => {
            err = ensureErrorType(err);
            workerSystemLog('error', `Http proxy error: ${err.stack || err.message}`);
        });

        server.listen(() => {
            const address = server.address();
            if (address !== null && typeof address === 'object') {
                resolve(`http://localhost:${address.port}/`);
            } else {
                reject(new AzFuncSystemError('Unexpected server address during http proxy setup'));
            }
        });

        server.on('close', () => {
            workerSystemLog('information', 'Http proxy closing');
        });
    });
}
