// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { CoreInvocationContext, RpcLogCategory, RpcLogLevel } from '@azure/functions-core';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { format } from 'util';
import * as app from '../src/app';
import { InvocationModel } from '../src/InvocationModel';
import * as setupModule from '../src/setup';
import { extractLogAttributes } from '../src/utils/extractLogAttributes';
import * as coreModule from '../src/utils/tryGetCoreApiLazy';
import { InvocationContext, LogHookContext } from '../types';

describe('structured logging', () => {
    afterEach(() => sinon.restore());

    function configure(enabled = true, supported = true) {
        sinon.stub(setupModule, 'structuredLogProperties').value(undefined);
        if (enabled) app.setup({ structuredLogProperties: 'lastPlainObject' });
        sinon.stub(coreModule, 'tryGetCoreApiLazy').returns({
            supportsStructuredLogProperties: supported,
        } as unknown as ReturnType<typeof coreModule.tryGetCoreApiLazy>);
    }

    async function invocation() {
        const calls: { level: RpcLogLevel; category: RpcLogCategory; message: string; metadata?: unknown }[] = [];
        const core: CoreInvocationContext = {
            invocationId: 'test-invocation',
            metadata: { name: 'logging', bindings: { trigger: { type: 'timerTrigger', direction: 'in' } } },
            request: {},
            log: (level, category, message, metadata) => calls.push({ level, category, message, metadata }),
        };
        const model = new InvocationModel(core);
        const { context } = await model.getArguments();
        return { context: context as InvocationContext, calls, model, core };
    }

    it('keeps default text-only logging and does not inspect the final argument', async () => {
        configure(false);
        const { context, calls } = await invocation();
        const properties = { model: 'olive' };
        const inspectPrototype = sinon.spy();
        const proxy = new Proxy(properties, {
            getPrototypeOf: () => {
                inspectPrototype();
                throw new Error('not inspected');
            },
        });
        context.log('result', proxy);
        expect(inspectPrototype.called).to.equal(false);
        expect(calls).to.deep.equal([
            { level: 'information', category: 'user', message: format('result', proxy), metadata: undefined },
        ]);
    });

    it('keeps formatting for every level while separately copying the final object', async () => {
        configure();
        const { context, calls } = await invocation();
        const properties = Object.freeze({ model: 'olive', attempts: 0, enabled: false });
        for (const method of ['log', 'info', 'warn', 'error', 'debug', 'trace'] as const) {
            context[method]('result %s %d %j', 'value', 3, properties);
        }
        expect(calls.map((call) => call.level)).to.deep.equal([
            'information',
            'information',
            'warning',
            'error',
            'debug',
            'trace',
        ]);
        for (const call of calls) {
            expect(call.message).to.equal(format('result %s %d %j', 'value', 3, properties));
            expect(call.metadata).to.deep.equal({ attributes: properties });
            expect((call.metadata as { attributes: unknown }).attributes).not.to.equal(properties);
        }
    });

    it('only extracts the final argument and accepts a single null-prototype object', async () => {
        configure();
        const { context, calls } = await invocation();
        const properties = Object.assign(Object.create(null) as Record<string, unknown>, { model: 'olive' });
        context.log(properties);
        context.log({ first: 'text' }, { last: 'attribute' });
        context.log({ first: 'text' }, 'last');
        context.error(new Error('failure'));
        context.log(['array']);
        expect(calls[0]?.metadata).to.deep.equal({ attributes: { model: 'olive' } });
        expect(calls[1]?.metadata).to.deep.equal({ attributes: { last: 'attribute' } });
        expect(calls.slice(2).every((call) => call.metadata === undefined)).to.equal(true);
    });

    it('filters invalid and reserved fields without getters, mutation or unbounded warnings', async () => {
        configure();
        const { context, calls } = await invocation();
        const getter = sinon.spy(() => {
            throw new Error('getter secret');
        });
        const properties: Record<string, unknown> = {
            model: 'olive',
            nan: NaN,
            infinity: Infinity,
            missing: undefined,
            nil: null,
            big: BigInt(2),
            nested: { secret: 'not exported' },
            array: [],
            error: new Error('private'),
            CategoryName: 'secret-category',
            'ExCePtIoN.type': 'secret-type',
            '_MS.foo': 'secret',
            'microsoft.foo': 'secret',
            'AI.operation.name': 'secret',
            constructor: 'secret',
        };
        Object.defineProperty(properties, 'getter', { enumerable: true, get: getter });
        Object.defineProperty(properties, 'hidden', { enumerable: false, value: 'hidden' });
        Object.freeze(properties);
        context.error('failure', properties);
        context.error('failure', properties);
        expect(getter.called).to.equal(false);
        const userCalls = calls.filter((call) => call.category === 'user');
        expect(userCalls).to.have.length(2);
        expect(userCalls[0]?.metadata).to.deep.equal({ attributes: { model: 'olive' } });
        expect(userCalls[0]?.message).to.equal(format('failure', properties));
        const warnings = calls.filter((call) => call.category === 'system');
        expect(warnings).to.have.length(1);
        expect(warnings[0]?.level).to.equal('warning');
        expect(warnings[0]?.message).not.to.contain('secret');
    });

    it('preserves text with one warning per invocation when the worker lacks support', async () => {
        configure(true, false);
        const first = await invocation();
        const second = await invocation();
        for (const current of [first, second]) {
            current.context.error('failure', { model: 'olive' });
            current.context.error('failure', { model: 'olive' });
            expect(current.calls.filter((call) => call.category === 'system')).to.have.length(1);
            const userCalls = current.calls.filter((call) => call.category === 'user');
            expect(userCalls).to.have.length(2);
            expect(userCalls[0]?.message).to.equal(format('failure', { model: 'olive' }));
            expect(userCalls[0]?.metadata).to.equal(undefined);
        }
    });

    it('contains proxy inspection failures and retains the existing formatted message', async () => {
        configure();
        const { context, calls } = await invocation();
        const proxy = new Proxy(
            { model: 'olive' },
            {
                getPrototypeOf: () => {
                    throw new Error('private');
                },
            }
        );
        const originalMessage = format('result', proxy);
        expect(() => context.log('result', proxy)).not.to.throw();
        expect(calls.find((call) => call.category === 'user')?.message).to.equal(originalMessage);
        expect(calls.find((call) => call.category === 'system')?.message).to.contain(
            'structured_log_inspection_failed'
        );
    });

    it('passes hook metadata and consumer options through the public API', () => {
        const registerHook = sinon.stub().returns({ dispose() {} });
        sinon
            .stub(coreModule, 'tryGetCoreApiLazy')
            .returns({ registerHook } as unknown as ReturnType<typeof coreModule.tryGetCoreApiLazy>);
        let observed: LogHookContext | undefined;
        app.hook.log(
            (context) => {
                observed = context;
            },
            { structuredLogProperties: true }
        );
        expect(registerHook.firstCall.args[2]).to.deep.equal({ structuredLogProperties: true });
        const handler = registerHook.firstCall.args[1] as (context: object) => void;
        const attributes = Object.freeze({ model: 'olive' });
        handler({ message: 'failure', level: 'error', category: 'user', attributes });
        expect(observed?.attributes).to.equal(attributes);
        const observedHook = observed;
        if (!observedHook) throw new Error('Expected the log hook to run');
        expect(() => {
            Reflect.set(observedHook, 'attributes', {});
        }).to.throw();
    });

    it('keeps setup opt-in on unrelated setup calls and rejects invalid configuration', () => {
        sinon.stub(setupModule, 'structuredLogProperties').value(undefined);
        expect(setupModule.structuredLogProperties).to.equal(undefined);
        app.setup({ structuredLogProperties: 'lastPlainObject' });
        app.setup({});
        expect(setupModule.structuredLogProperties).to.equal('lastPlainObject');
        expect(() =>
            app.setup({ structuredLogProperties: 'invalid' } as unknown as Parameters<typeof app.setup>[0])
        ).to.throw();
    });

    it('rejects hostile descriptor enumeration without leaking partial attributes', () => {
        const proxy = new Proxy(
            {},
            {
                ownKeys: () => {
                    throw new Error('private');
                },
            }
        );
        expect(extractLogAttributes(proxy)).to.deep.equal({
            rejectedCount: 0,
            reason: 'structured_log_inspection_failed',
        });
    });
});
