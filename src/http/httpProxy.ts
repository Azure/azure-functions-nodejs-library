// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { serialize as serializeCookie } from 'cookie';
import { EventEmitter } from 'events';
import * as http from 'http';
import * as net from 'net';
import { AzFuncSystemError, ensureErrorType } from '../errors';
import { nonNullProp } from '../utils/nonNull';
import { workerSystemLog } from '../utils/workerSystemLog';
import { HttpResponse } from './HttpResponse';

const requests: Record<string, http.IncomingMessage> = {};
const responses: Record<string, http.ServerResponse> = {};
const minPort = 55000;
const maxPort = 55025;
const loopbackBindAddresses = ['127.0.0.1', '::1'];

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

    if (userRes.cookies.length > 0) {
        setCookies(userRes, proxyRes);
    }

    if (userRes.body) {
        for await (const chunk of userRes.body.values()) {
            proxyRes.write(chunk);
        }
    }
    proxyRes.end();
}

function setCookies(userRes: HttpResponse, proxyRes: http.ServerResponse): void {
    const serializedCookies: string[] = userRes.cookies.map((c) => {
        let sameSite: true | false | 'lax' | 'strict' | 'none' | undefined;
        switch (c.sameSite) {
            case 'Lax':
                sameSite = 'lax';
                break;
            case 'None':
                sameSite = 'none';
                break;
            case 'Strict':
                sameSite = 'strict';
                break;
            default:
                sameSite = c.sameSite;
        }
        return serializeCookie(c.name, c.value, {
            domain: c.domain,
            path: c.path,
            expires: typeof c.expires === 'number' ? new Date(c.expires) : c.expires,
            secure: c.secure,
            httpOnly: c.httpOnly,
            sameSite: sameSite,
            maxAge: c.maxAge,
        });
    });
    proxyRes.setHeader('Set-Cookie', serializedCookies);
}

export async function setupHttpProxy(): Promise<string> {
    const bindAddress = await selectUsableLoopbackBindAddress();
    const server = http.createServer();

    server.on('request', (req, res) => {
        const invocationId = getInvocationId(req);
        if (invocationId) {
            requests[invocationId] = req;
            responses[invocationId] = res;
            invocRequestEmitter.emit(invocationId);
        } else {
            workerSystemLog('error', `Http proxy request missing or invalid header ${invocationIdHeader}`);
            res.statusCode = 400;
            res.end();
        }
    });

    server.on('error', (err) => {
        err = ensureErrorType(err);
        workerSystemLog('error', `Http proxy error: ${err.stack || err.message}`);
    });

    server.on('close', () => {
        workerSystemLog('information', 'Http proxy closing');
    });

    await listenServer(server, 0, bindAddress);

    const address = server.address();
    if (address === null || typeof address !== 'object') {
        throw new AzFuncSystemError('Unexpected server address during http proxy setup');
    }

    if (address.port === 0) {
        workerSystemLog('debug', `Port 0 assigned. Finding open port.`);
        const openPort = await findOpenPort(bindAddress);
        await closeServer(server);
        await listenServer(server, openPort, bindAddress);
        workerSystemLog('debug', `Server is now listening on found open port: ${openPort}`);
        return serializeHttpUri(bindAddress, openPort);
    } else {
        workerSystemLog('debug', `Auto-assigned port is valid. Port: ${address.port}`);
        return serializeHttpUri(bindAddress, address.port);
    }
}

function getInvocationId(req: http.IncomingMessage): string | undefined {
    const invocationIdValues = getRawHeaderValues(req, invocationIdHeader);
    if (invocationIdValues.length !== 1) {
        return undefined;
    }

    const [invocationId] = invocationIdValues;
    if (!invocationId || invocationId.trim() !== invocationId) {
        return undefined;
    }

    return invocationId;
}

function getRawHeaderValues(req: http.IncomingMessage, headerName: string): string[] {
    const values: string[] = [];
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
        const rawHeaderName = req.rawHeaders[i];
        const rawHeaderValue = req.rawHeaders[i + 1];
        if (rawHeaderName && rawHeaderName.toLowerCase() === headerName && rawHeaderValue !== undefined) {
            values.push(rawHeaderValue);
        }
    }

    return values;
}

async function selectUsableLoopbackBindAddress(): Promise<string> {
    for (const bindAddress of loopbackBindAddresses) {
        if (await canListenOnAddress(bindAddress)) {
            return bindAddress;
        }
    }

    throw new AzFuncSystemError('Unable to find a usable loopback address for HTTP streaming.');
}

async function canListenOnAddress(bindAddress: string): Promise<boolean> {
    const server = net.createServer();
    try {
        await listenServer(server, 0, bindAddress);
        await closeServer(server);
        return true;
    } catch (err) {
        const error = ensureErrorType(err);
        const code = (<NodeJS.ErrnoException>error).code;
        if (code === 'EADDRNOTAVAIL' || code === 'EAFNOSUPPORT') {
            return false;
        }

        throw error;
    }
}

function serializeHttpUri(bindAddress: string, port: number): string {
    const host = net.isIPv6(bindAddress) ? `[${bindAddress}]` : bindAddress;
    return `http://${host}:${port}/`;
}

async function findOpenPort(bindAddress: string, port = minPort): Promise<number> {
    if (port > maxPort) {
        throw new AzFuncSystemError(
            `No available ports found between ${minPort} and ${maxPort}. To enable HTTP streaming, please open a port in this range.`
        );
    }

    const server = net.createServer();
    try {
        await listenServer(server, port, bindAddress);
        const address = server.address();
        if (address !== null && typeof address === 'object') {
            const openPort = address.port;
            await closeServer(server);
            return openPort;
        } else {
            throw new AzFuncSystemError('Unexpected server address while finding an open port');
        }
    } catch (err) {
        const error = ensureErrorType(err);
        if ((<NodeJS.ErrnoException>error).code === 'EADDRINUSE') {
            return findOpenPort(bindAddress, port + 1);
        }

        throw error;
    }
}

async function listenServer(server: net.Server, port: number, host: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const onListening = () => {
            server.off('error', onError);
            resolve();
        };
        const onError = (err: Error) => {
            server.off('listening', onListening);
            reject(err);
        };

        server.once('listening', onListening);
        server.once('error', onError);

        try {
            server.listen(port, host);
        } catch (err) {
            server.off('listening', onListening);
            server.off('error', onError);
            reject(err);
        }
    });
}

async function closeServer(server: net.Server): Promise<void> {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
