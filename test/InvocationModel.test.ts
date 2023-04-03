// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcLogCategory, RpcLogLevel } from '@azure/functions-core';
import { expect } from 'chai';
import 'mocha';
import { InvocationContext } from '../src';
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
    });
});
