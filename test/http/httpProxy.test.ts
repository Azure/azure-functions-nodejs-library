// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { randomUUID } from 'crypto';
import * as http from 'http';
import * as net from 'net';
import * as sinon from 'sinon';
import { sendProxyResponse, setupHttpProxy, waitForProxyRequest } from '../../src/http/httpProxy';
import { HttpResponse } from '../../src/http/HttpResponse';
import * as workerLogModule from '../../src/utils/workerSystemLog';

type ListenCall = {
    port: number;
    host: string;
};

type ProxyResponse = {
    statusCode: number;
    headers: http.IncomingHttpHeaders;
    body: string;
};

describe('httpProxy', () => {
    let sandbox: sinon.SinonSandbox;
    let trackedServers: net.Server[];

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        trackedServers = [];
    });

    afterEach(async () => {
        await Promise.allSettled(trackedServers.map((server) => closeServerIfListening(server)));
        sandbox.restore();
    });

    it('returns a reachable loopback HttpUri and correlates responses when waiting first', async () => {
        captureHttpServers();

        const proxyUri = await setupHttpProxy();
        const proxyUrl = new URL(proxyUri);
        const host = normalizeHost(proxyUrl.hostname);
        const invocationId = randomUUID();
        const requestBody = 'proxy request body';

        expect(proxyUri).to.match(/^http:\/\/(127\.0\.0\.1|\[::1\]):\d+\/$/);
        expect(host).to.be.oneOf(['127.0.0.1', '::1']);

        const proxyReqPromise = waitForProxyRequest(invocationId);
        const clientResponsePromise = sendProxyRequest(proxyUri, {
            method: 'POST',
            path: '/api/proxy?name=value',
            headers: {
                'x-ms-invocation-id': invocationId,
                'x-test-request': 'forwarded',
            },
            body: requestBody,
        });

        const proxyReq = await proxyReqPromise;
        expect(proxyReq.method).to.equal('POST');
        expect(proxyReq.url).to.equal('/api/proxy?name=value');
        expect(proxyReq.headers['x-test-request']).to.equal('forwarded');
        expect(await readStreamBody(proxyReq)).to.equal(requestBody);

        await sendProxyResponse(
            invocationId,
            new HttpResponse({
                status: 202,
                headers: {
                    'x-test-response': 'propagated',
                },
                cookies: [
                    {
                        name: 'session',
                        value: 'abc123',
                        httpOnly: true,
                        path: '/',
                        sameSite: 'Lax',
                    },
                    {
                        name: 'theme',
                        value: 'dark',
                        secure: true,
                        sameSite: 'None',
                    },
                ],
                body: 'proxy response body',
            })
        );

        const clientResponse = await clientResponsePromise;
        expect(clientResponse.statusCode).to.equal(202);
        expect(clientResponse.headers['x-ms-invocation-id']).to.equal(invocationId);
        expect(clientResponse.headers['x-test-response']).to.equal('propagated');
        expect(clientResponse.body).to.equal('proxy response body');
        expect(clientResponse.headers['set-cookie']).to.deep.equal([
            'session=abc123; Path=/; HttpOnly; SameSite=Lax',
            'theme=dark; Secure; SameSite=None',
        ]);
    });

    it('returns buffered proxy requests when the request arrives before waiting', async () => {
        captureHttpServers();

        const proxyUri = await setupHttpProxy();
        const proxyServer = trackedServers.find((server) => server instanceof http.Server);
        const invocationId = randomUUID();

        expect(proxyServer).to.not.equal(undefined);
        if (!proxyServer) {
            throw new Error('Expected setupHttpProxy to create an HTTP server');
        }
        const requestSeen = new Promise<void>((resolve) => {
            proxyServer.once('request', () => resolve());
        });

        const clientResponsePromise = sendProxyRequest(proxyUri, {
            method: 'PUT',
            path: '/api/buffered',
            headers: {
                'x-ms-invocation-id': invocationId,
            },
            body: 'buffered request body',
        });

        await requestSeen;

        const proxyReq = await waitForProxyRequest(invocationId);
        expect(proxyReq.method).to.equal('PUT');
        expect(proxyReq.url).to.equal('/api/buffered');
        expect(await readStreamBody(proxyReq)).to.equal('buffered request body');

        await sendProxyResponse(invocationId, new HttpResponse({ status: 204 }));

        const clientResponse = await clientResponsePromise;
        expect(clientResponse.statusCode).to.equal(204);
        expect(clientResponse.body).to.equal('');
    });

    it('rejects proxy requests with missing or invalid invocation ids', async () => {
        captureHttpServers();
        const workerSystemLogStub = sandbox.stub(workerLogModule, 'workerSystemLog');

        const proxyUri = await setupHttpProxy();
        workerSystemLogStub.resetHistory();

        const responses = await Promise.all([
            sendProxyRequest(proxyUri, {
                method: 'GET',
                path: '/missing',
                headers: {},
            }),
            sendProxyRequest(proxyUri, {
                method: 'GET',
                path: '/empty',
                headers: {
                    'x-ms-invocation-id': '',
                },
            }),
            sendProxyRequest(proxyUri, {
                method: 'GET',
                path: '/duplicate',
                headers: {
                    'x-ms-invocation-id': ['first-id', 'second-id'],
                },
            }),
        ]);

        for (const response of responses) {
            expect(response.statusCode).to.equal(400);
            expect(response.body).to.equal('');
        }

        expect(workerSystemLogStub.callCount).to.equal(3);
        for (const call of workerSystemLogStub.getCalls()) {
            expect(call.args[0]).to.equal('error');
            expect(call.args[1]).to.contain('Http proxy request missing or invalid header x-ms-invocation-id');
        }
    });

    it('falls back to an open port on the same loopback address when port 0 is reported', async () => {
        const httpListenCalls: ListenCall[] = [];
        const netListenCalls: ListenCall[] = [];

        captureHttpServers(httpListenCalls, true);
        captureNetServers(netListenCalls);

        const proxyUri = await setupHttpProxy();
        const proxyUrl = new URL(proxyUri);
        const host = normalizeHost(proxyUrl.hostname);
        const port = Number(proxyUrl.port);

        expect(host).to.be.oneOf(['127.0.0.1', '::1']);
        expect(port).to.be.within(55000, 55025);
        expect(httpListenCalls).to.deep.equal([
            { port: 0, host },
            { port, host },
        ]);
        expect(netListenCalls[0]).to.deep.equal({ port: 0, host });
        expect(netListenCalls).to.deep.include({ port, host });
    });

    function captureHttpServers(listenCalls?: ListenCall[], forceReportedPortZero = false): void {
        const createServer = http.createServer.bind(http);
        sandbox.stub(http, 'createServer').callsFake((...args: Parameters<typeof http.createServer>) => {
            const server = createServer(...args);
            trackedServers.push(server);

            if (listenCalls) {
                const listen = server.listen.bind(server);
                sandbox.stub(server, 'listen').callsFake((...listenArgs: any[]) => {
                    const [port, host] = listenArgs;
                    listenCalls.push({ port, host });
                    return listen(...listenArgs);
                });
            }

            if (forceReportedPortZero) {
                const address = server.address.bind(server);
                let addressCallCount = 0;
                sandbox.stub(server, 'address').callsFake(() => {
                    const currentAddress = address();
                    if (addressCallCount++ === 0 && currentAddress !== null && typeof currentAddress !== 'string') {
                        return { ...currentAddress, port: 0 };
                    }
                    return currentAddress;
                });
            }

            return server;
        });
    }

    function captureNetServers(listenCalls: ListenCall[]): void {
        const createServer = net.createServer.bind(net);
        sandbox.stub(net, 'createServer').callsFake((...args: Parameters<typeof net.createServer>) => {
            const server = createServer(...args);
            trackedServers.push(server);

            const listen = server.listen.bind(server);
            sandbox.stub(server, 'listen').callsFake((...listenArgs: any[]) => {
                const [port, host] = listenArgs;
                listenCalls.push({ port, host });
                return listen(...listenArgs);
            });

            return server;
        });
    }
});

function normalizeHost(hostname: string): string {
    return hostname.replace(/^\[(.*)\]$/, '$1');
}

async function readStreamBody(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString();
}

async function sendProxyRequest(
    proxyUri: string,
    init: {
        method: string;
        path: string;
        headers: http.OutgoingHttpHeaders;
        body?: string;
    }
): Promise<ProxyResponse> {
    const proxyUrl = new URL(proxyUri);
    const hostname = normalizeHost(proxyUrl.hostname);

    return new Promise((resolve, reject) => {
        const req = http.request(
            {
                family: net.isIPv6(hostname) ? 6 : 4,
                hostname,
                method: init.method,
                path: init.path,
                port: Number(proxyUrl.port),
                headers: init.headers,
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk: Buffer | string) => {
                    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode ?? 0,
                        headers: res.headers,
                        body: Buffer.concat(chunks).toString(),
                    });
                });
            }
        );

        req.on('error', reject);
        if (init.body) {
            req.write(init.body);
        }
        req.end();
    });
}

async function closeServerIfListening(server: net.Server): Promise<void> {
    if (!server.listening) {
        return;
    }

    await new Promise<void>((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
