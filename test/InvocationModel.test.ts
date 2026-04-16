// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { RpcLogCategory, RpcLogLevel } from '@azure/functions-core';
import { expect } from 'chai';
import { ImageContent, InvocationContext, McpContent } from '../src';
import { InvocationModel } from '../src/InvocationModel';

function testLog(_level: RpcLogLevel, _category: RpcLogCategory, message: string) {
    console.log(message);
}

describe('InvocationModel', () => {
    describe('getResponse', () => {
        it('Hello world http', async () => {
            const model = new InvocationModel({
                invocationId: 'testInvocId',
                metadata: {
                    name: 'testFuncName',
                    bindings: {
                        httpTrigger1: {
                            type: 'httpTrigger',
                            direction: 'in',
                        },
                        $return: {
                            type: 'http',
                            direction: 'out',
                        },
                    },
                },
                request: {},
                log: testLog,
            });
            const context = new InvocationContext();
            const response = await model.getResponse(context, { body: 'Hello, world!' });
            expect(response).to.deep.equal({
                invocationId: 'testInvocId',
                outputData: [],
                returnValue: {
                    http: {
                        body: {
                            bytes: Buffer.from('Hello, world!'),
                        },
                        cookies: [],
                        enableContentNegotiation: false,
                        headers: {
                            'content-type': 'text/plain;charset=UTF-8',
                        },
                        statusCode: '200',
                    },
                },
            });
        });

        it('undefined output is not included in rpc response', async () => {
            // https://github.com/Azure/azure-functions-nodejs-library/issues/71
            // If an output binding is undefined or null, we should exclude it from the `outputData` array otherwise host will throw an error
            // https://github.com/Azure/azure-functions-host/blob/6eea6da0952857b4cc64339f329cdf61432b5815/src/WebJobs.Script.Grpc/Channel/GrpcWorkerChannel.cs#L871
            const model = new InvocationModel({
                invocationId: 'testInvocId',
                metadata: {
                    name: 'testFuncName',
                    bindings: {
                        timerTrigger1: {
                            type: 'timerTrigger',
                            direction: 'in',
                        },
                        queueOutput1: {
                            type: 'queue',
                            direction: 'out',
                        },
                    },
                },
                request: {},
                log: testLog,
            });
            const context = new InvocationContext();
            const response = await model.getResponse(context, undefined);
            expect(response).to.deep.equal({ invocationId: 'testInvocId', outputData: [], returnValue: undefined });
        });

        // https://github.com/Azure/azure-functions-nodejs-library/issues/210
        it('Missing binding', async () => {
            const model = new InvocationModel({
                invocationId: 'testInvocId',
                metadata: {
                    name: 'testFuncName',
                    bindings: {
                        httpTrigger1: {
                            type: 'httpTrigger',
                            direction: 'in',
                        },
                        $return: {
                            type: 'http',
                            direction: 'out',
                        },
                    },
                },
                request: {
                    inputData: [
                        {
                            name: 'httpTriggerMissing',
                        },
                    ],
                },
                log: testLog,
            });

            try {
                await model.getArguments();
                expect.fail('Expected getArguments() to throw for a missing binding.');
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                expect(message).to.equal(
                    'Failed to find binding "httpTriggerMissing" in bindings "httpTrigger1, $return".'
                );
            }
        });

        it('MCP trigger with explicit $return serializes as RpcTypedData.string', async () => {
            const model = new InvocationModel({
                invocationId: 'mcpInvocId',
                metadata: {
                    name: 'mcpFuncName',
                    bindings: {
                        mcpToolTrigger1: {
                            type: 'mcpToolTrigger',
                            direction: 'in',
                        },
                        $return: {
                            type: 'queue',
                            direction: 'out',
                        },
                    },
                },
                request: {},
                log: testLog,
            });

            const context = new InvocationContext();
            const response = await model.getResponse(
                context,
                new ImageContent({ data: 'YmFzZTY0', mimeType: 'image/png' })
            );

            expect(response.invocationId).to.equal('mcpInvocId');
            expect(response.outputData).to.deep.equal([]);
            expect(response.returnValue).to.have.property('string');

            const payload = JSON.parse((response.returnValue as { string: string }).string) as {
                type: string;
                content: string;
            };

            expect(payload.type).to.equal('image');
            const imageContent = JSON.parse(payload.content) as { type: string; mimeType: string };
            expect(imageContent.type).to.equal('image');
            expect(imageContent.mimeType).to.equal('image/png');
        });

        it('MCP trigger without $return uses fallback and includes structuredContent for marked class', async () => {
            class MarkedResult {
                constructor(public id: string) {}
            }
            McpContent(MarkedResult);

            const model = new InvocationModel({
                invocationId: 'mcpFallbackInvocId',
                metadata: {
                    name: 'mcpFallbackFuncName',
                    bindings: {
                        mcpToolTrigger1: {
                            type: 'mcpToolTrigger',
                            direction: 'in',
                        },
                    },
                },
                request: {},
                log: testLog,
            });

            const context = new InvocationContext();
            const response = await model.getResponse(context, new MarkedResult('r1'));

            expect(response.invocationId).to.equal('mcpFallbackInvocId');
            expect(response.outputData).to.deep.equal([]);
            expect(response.returnValue).to.have.property('string');

            const payload = JSON.parse((response.returnValue as { string: string }).string) as {
                type: string;
                structuredContent?: string;
            };

            expect(payload.type).to.equal('text');
            expect(payload.structuredContent).to.equal(JSON.stringify({ id: 'r1' }));
        });
    });
});
