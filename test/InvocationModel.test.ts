// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { CoreInvocationContext, RpcInvocationRequest, RpcParameterBinding } from '@azure/functions-core';
import { expect } from 'chai';
import 'mocha';
import { InvocationModel } from '../src/InvocationModel';
import { AzureFunction, Context } from '../types';
import sinon = require('sinon');

const timerTriggerInput: RpcParameterBinding = {
    name: 'myTimer',
    data: {
        json: JSON.stringify({
            Schedule: {},
            ScheduleStatus: {
                Last: '2016-10-04T10:15:00+00:00',
                LastUpdated: '2016-10-04T10:16:00+00:00',
                Next: '2016-10-04T10:20:00+00:00',
            },
            IsPastDue: false,
        }),
    },
};

const rpcRequest: RpcInvocationRequest = <RpcInvocationRequest>{
    functionId: 'id',
    invocationId: '1',
    inputData: [timerTriggerInput],
};

const createCoreCtx = (coreLogger: any, request: RpcInvocationRequest): CoreInvocationContext =>
    <CoreInvocationContext>{
        invocationId: 'test',
        request,
        metadata: {
            name: 'test',
            bindings: {
                myTimer: {
                    type: 'timerTrigger',
                    direction: 'in',
                    dataType: 'undefined',
                },
            },
        },
        log: coreLogger,
    };

describe('InvocationModel', () => {
    let coreLogger: any;

    beforeEach(() => {
        coreLogger = sinon.stub();
    });

    it('logs error for calling context.done() twice', async () => {
        const coreCtx = createCoreCtx(coreLogger, rpcRequest);
        const invocationModel = new InvocationModel(coreCtx);

        const { context, inputs } = await invocationModel.getArguments();

        const functionCallback: AzureFunction = (context: Context) => {
            // eslint-disable-next-line deprecation/deprecation
            context.done(null, 'result1');
            // eslint-disable-next-line deprecation/deprecation
            context.done(null, 'result2');
        };

        void (await invocationModel.invokeFunction(context as Context, inputs, functionCallback));

        const errorMsg =
            "Error: 'done' has already been called. Please check your script for extraneous calls to 'done'.";

        expect(coreLogger.called).to.be.true;
        expect(coreLogger.callCount).to.equal(1);
        expect(coreLogger.args).to.deep.equal([['error', 'system', errorMsg]]);
    });

    it('logs error for calling context.done() in async callback', async () => {
        const coreCtx = createCoreCtx(coreLogger, rpcRequest);
        const invocationModel = new InvocationModel(coreCtx);

        const { context, inputs } = await invocationModel.getArguments();

        const functionCallback: AzureFunction = async (context: Context) => {
            // eslint-disable-next-line deprecation/deprecation
            context.done(null, 'result');
        };

        void (await invocationModel.invokeFunction(context as Context, inputs, functionCallback));

        const errorMsg =
            "Error: Choose either to return a promise or call 'done'. Do not use both in your script. Learn more: https://go.microsoft.com/fwlink/?linkid=2097909";

        expect(coreLogger.called).to.be.true;
        expect(coreLogger.callCount).to.equal(1);
        expect(coreLogger.args).to.deep.equal([['error', 'system', errorMsg]]);
    });

    it('logs warning for attempting to log after function execution completes', async () => {
        const coreCtx = createCoreCtx(coreLogger, rpcRequest);
        const invocationModel = new InvocationModel(coreCtx);

        const { context, inputs } = await invocationModel.getArguments();

        const functionCallback: AzureFunction = (context: Context) => {
            // eslint-disable-next-line deprecation/deprecation
            context.done(null, 'result');
            context.log('bad log');
        };

        void (await invocationModel.invokeFunction(context as Context, inputs, functionCallback));

        let warningMsg =
            "Warning: Unexpected call to 'log' on the context object after function execution has completed. Please check for asynchronous calls that are not awaited or calls to 'done' made before function execution completes. ";
        warningMsg += `Function name: ${coreCtx.metadata.name}. Invocation Id: ${coreCtx.invocationId}. `;
        warningMsg += 'Learn more: https://go.microsoft.com/fwlink/?linkid=2097909';

        expect(coreLogger.called).to.be.true;
        expect(coreLogger.callCount).to.equal(2);
        expect(coreLogger.args[0]).to.deep.equal(['warning', 'system', warningMsg]);
    });

    it('suppresses bad pattern logs if flag is set', async () => {
        const coreCtx = createCoreCtx(coreLogger, rpcRequest);
        const invocationModel = new InvocationModel(coreCtx);

        const { context, inputs } = await invocationModel.getArguments();

        const functionCallback: AzureFunction = async (context: Context) => {
            context.suppressBadPatternError = true;
            // eslint-disable-next-line deprecation/deprecation
            context.done(null, 'result');
            context.log('bad log');
        };

        void (await invocationModel.invokeFunction(context as Context, inputs, functionCallback));

        expect(coreLogger.callCount).to.equal(1);
        expect(coreLogger.args).to.deep.equal([['information', 'user', 'bad log']]);
    });
});
