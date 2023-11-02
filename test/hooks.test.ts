// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import 'mocha';
import {
    AppStartContext,
    AppTerminateContext,
    HookContext,
    InvocationContext,
    InvocationHookContext,
    PostInvocationContext,
    PreInvocationContext,
    app,
} from '../src/index';

describe('hooks', () => {
    it("register doesn't throw error in unit test mode", () => {
        app.hook.appStart(() => {});
        app.hook.appTerminate(() => {});
        app.hook.postInvocation(() => {});
        const registeredHook = app.hook.preInvocation(() => {});
        registeredHook.dispose();
    });

    it('AppTerminateContext', () => {
        const context = new AppTerminateContext();
        validateHookContext(context);
    });

    it('AppStartContext', () => {
        const context = new AppStartContext();
        validateHookContext(context);
    });

    it('PreInvocationContext', () => {
        const context = new PreInvocationContext();
        validateInvocationHookContext(context);
        expect(typeof context.functionHandler).to.equal('function');

        const updatedFunc = () => {
            console.log('changed');
        };
        context.functionHandler = updatedFunc;
        expect(context.functionHandler).to.equal(updatedFunc);
    });

    it('PostInvocationContext', () => {
        const context = new PostInvocationContext();
        validateInvocationHookContext(context);
        expect(context.error).to.equal(undefined);
        expect(context.result).to.equal(undefined);

        const newError = new Error('test1');
        context.error = newError;
        context.result = 'test2';
        expect(context.error).to.equal(newError);
        expect(context.result).to.equal('test2');
    });

    function validateInvocationHookContext(context: InvocationHookContext): void {
        validateHookContext(context);
        expect(context.inputs).to.deep.equal([]);
        expect(context.invocationContext).to.deep.equal(new InvocationContext());

        expect(() => {
            context.invocationContext = <any>{};
        }).to.throw();
        context.inputs = ['change'];
        expect(context.inputs).to.deep.equal(['change']);
    }

    function validateHookContext(context: HookContext) {
        expect(context.hookData).to.deep.equal({});
        expect(() => {
            context.hookData = {};
        }).to.throw();
    }
});
