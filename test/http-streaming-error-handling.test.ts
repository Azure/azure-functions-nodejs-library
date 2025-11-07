// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { HttpResponse } from '../src/http/HttpResponse';
import { InvocationContext } from '../src/InvocationContext';
import { InvocationModel } from '../src/InvocationModel';
import { enableHttpStream, setup } from '../src/setup';

describe('HTTP Streaming Error Handling', () => {
    let originalEnableHttpStream: boolean;

    before(() => {
        originalEnableHttpStream = enableHttpStream;
    });

    afterEach(() => {
        // Reset to original state
        setup({ enableHttpStream: originalEnableHttpStream });
    });

    it('should convert validation errors to HTTP 400 responses in streaming mode', async () => {
        // Enable HTTP streaming for this test
        setup({ enableHttpStream: true });

        // Create a mock HTTP trigger invocation model
        const mockCoreCtx = {
            invocationId: 'test-invocation-123',
            request: {
                inputData: [],
                triggerMetadata: {},
            },
            metadata: {
                name: 'testHttpFunction',
                bindings: {
                    httpTrigger: { type: 'httpTrigger', direction: 'in' },
                },
            },
            log: () => {},
            state: undefined,
        };

        const invocationModel = new InvocationModel(mockCoreCtx as any);

        // Create a mock context
        const context = new InvocationContext({
            invocationId: 'test-invocation-123',
            functionName: 'testHttpFunction',
            logHandler: () => {},
            retryContext: undefined,
            traceContext: undefined,
            triggerMetadata: {},
            options: {},
        });

        // Create a handler that throws a validation error
        const errorHandler = () => {
            throw new Error('Invalid input parameters provided');
        };

        // Should convert error to HTTP response instead of throwing
        const result = await invocationModel.invokeFunction(context, [], errorHandler);

        expect(result).to.be.instanceOf(HttpResponse);
        const httpResponse = result as HttpResponse;
        expect(httpResponse.status).to.equal(400);

        const responseBody = (await httpResponse.json()) as any;
        expect(responseBody).to.have.property('error', 'Invalid input parameters provided');
        expect(responseBody).to.have.property('timestamp');
        expect(responseBody).to.have.property('invocationId', 'test-invocation-123');
    });

    it('should convert unauthorized errors to HTTP 401 responses in streaming mode', async () => {
        setup({ enableHttpStream: true });

        const mockCoreCtx = {
            invocationId: 'test-invocation-456',
            request: { inputData: [], triggerMetadata: {} },
            metadata: {
                name: 'testHttpFunction',
                bindings: { httpTrigger: { type: 'httpTrigger', direction: 'in' } },
            },
            log: () => {},
            state: undefined,
        };

        const invocationModel = new InvocationModel(mockCoreCtx as any);
        const context = new InvocationContext({
            invocationId: 'test-invocation-456',
            functionName: 'testHttpFunction',
            logHandler: () => {},
            retryContext: undefined,
            traceContext: undefined,
            triggerMetadata: {},
            options: {},
        });

        const errorHandler = () => {
            throw new Error('Unauthorized access to resource');
        };

        // Should convert error to HTTP 401 response
        const result = await invocationModel.invokeFunction(context, [], errorHandler);

        expect(result).to.be.instanceOf(HttpResponse);
        const httpResponse = result as HttpResponse;
        expect(httpResponse.status).to.equal(401);

        const responseBody = (await httpResponse.json()) as any;
        expect(responseBody.error).to.equal('Unauthorized access to resource');
    });

    it('should convert system errors to HTTP 500 responses in streaming mode', async () => {
        setup({ enableHttpStream: true });

        const mockCoreCtx = {
            invocationId: 'test-invocation-789',
            request: { inputData: [], triggerMetadata: {} },
            metadata: {
                name: 'testHttpFunction',
                bindings: { httpTrigger: { type: 'httpTrigger', direction: 'in' } },
            },
            log: () => {},
            state: undefined,
        };

        const invocationModel = new InvocationModel(mockCoreCtx as any);
        const context = new InvocationContext({
            invocationId: 'test-invocation-789',
            functionName: 'testHttpFunction',
            logHandler: () => {},
            retryContext: undefined,
            traceContext: undefined,
            triggerMetadata: {},
            options: {},
        });

        const errorHandler = () => {
            throw new Error('Database connection failed');
        };

        // Should convert system error to HTTP 500 response
        const result = await invocationModel.invokeFunction(context, [], errorHandler);

        expect(result).to.be.instanceOf(HttpResponse);
        const httpResponse = result as HttpResponse;
        expect(httpResponse.status).to.equal(500);

        const responseBody = (await httpResponse.json()) as any;
        expect(responseBody.error).to.equal('Database connection failed');
        expect(responseBody.invocationId).to.equal('test-invocation-789');
    });

    it('should still throw errors for non-HTTP streaming mode', async () => {
        // Disable HTTP streaming
        setup({ enableHttpStream: false });

        const mockCoreCtx = {
            invocationId: 'test-invocation-000',
            request: { inputData: [], triggerMetadata: {} },
            metadata: {
                name: 'testHttpFunction',
                bindings: { httpTrigger: { type: 'httpTrigger', direction: 'in' } },
            },
            log: () => {},
            state: undefined,
        };

        const invocationModel = new InvocationModel(mockCoreCtx as any);
        const context = new InvocationContext({
            invocationId: 'test-invocation-000',
            functionName: 'testHttpFunction',
            logHandler: () => {},
            retryContext: undefined,
            traceContext: undefined,
            triggerMetadata: {},
            options: {},
        });

        const errorHandler = () => {
            throw new Error('Test error should be thrown');
        };

        // Should throw the error instead of converting to HttpResponse
        await expect(invocationModel.invokeFunction(context, [], errorHandler)).to.be.rejectedWith(
            'Test error should be thrown'
        );
    });

    it('should still throw errors for non-HTTP triggers even with streaming enabled', async () => {
        setup({ enableHttpStream: true });

        // Create a non-HTTP trigger (timer trigger)
        const mockCoreCtx = {
            invocationId: 'test-invocation-timer',
            request: { inputData: [], triggerMetadata: {} },
            metadata: {
                name: 'testTimerFunction',
                bindings: { timerTrigger: { type: 'timerTrigger', direction: 'in' } },
            },
            log: () => {},
            state: undefined,
        };

        const invocationModel = new InvocationModel(mockCoreCtx as any);
        const context = new InvocationContext({
            invocationId: 'test-invocation-timer',
            functionName: 'testTimerFunction',
            logHandler: () => {},
            retryContext: undefined,
            traceContext: undefined,
            triggerMetadata: {},
            options: {},
        });

        const errorHandler = () => {
            throw new Error('Timer function error should be thrown');
        };

        // Should throw the error for non-HTTP triggers
        await expect(invocationModel.invokeFunction(context, [], errorHandler)).to.be.rejectedWith(
            'Timer function error should be thrown'
        );
    });

    it('should set proper Content-Type headers in HTTP error responses', async () => {
        setup({ enableHttpStream: true });

        const mockCoreCtx = {
            invocationId: 'test-content-type',
            request: { inputData: [], triggerMetadata: {} },
            metadata: {
                name: 'testHttpFunction',
                bindings: { httpTrigger: { type: 'httpTrigger', direction: 'in' } },
            },
            log: () => {},
            state: undefined,
        };

        const invocationModel = new InvocationModel(mockCoreCtx as any);
        const context = new InvocationContext({
            invocationId: 'test-content-type',
            functionName: 'testHttpFunction',
            logHandler: () => {},
            retryContext: undefined,
            traceContext: undefined,
            triggerMetadata: {},
            options: {},
        });

        const errorHandler = () => {
            throw new Error('Test error for headers');
        };

        const result = await invocationModel.invokeFunction(context, [], errorHandler);

        expect(result).to.be.instanceOf(HttpResponse);
        const httpResponse = result as HttpResponse;
        expect(httpResponse.headers.get('Content-Type')).to.equal('application/json');
    });

    it('should handle different error types with appropriate status codes', async () => {
        setup({ enableHttpStream: true });

        const errorTestCases = [
            { error: 'Not found resource', expectedStatus: 404 },
            { error: 'Forbidden operation detected', expectedStatus: 403 },
            { error: 'Request timeout happened', expectedStatus: 408 },
            { error: 'Too many requests made', expectedStatus: 429 },
            { error: 'Some random error', expectedStatus: 500 },
        ];

        for (const testCase of errorTestCases) {
            const mockCoreCtx = {
                invocationId: `test-${testCase.expectedStatus}`,
                request: { inputData: [], triggerMetadata: {} },
                metadata: {
                    name: 'testHttpFunction',
                    bindings: { httpTrigger: { type: 'httpTrigger', direction: 'in' } },
                },
                log: () => {},
                state: undefined,
            };

            const invocationModel = new InvocationModel(mockCoreCtx as any);
            const context = new InvocationContext({
                invocationId: `test-${testCase.expectedStatus}`,
                functionName: 'testHttpFunction',
                logHandler: () => {},
                retryContext: undefined,
                traceContext: undefined,
                triggerMetadata: {},
                options: {},
            });

            const errorHandler = () => {
                throw new Error(testCase.error);
            };

            const result = await invocationModel.invokeFunction(context, [], errorHandler);

            expect(result).to.be.instanceOf(HttpResponse);
            const httpResponse = result as HttpResponse;
            expect(httpResponse.status).to.equal(testCase.expectedStatus);

            const responseBody = (await httpResponse.json()) as any;
            expect(responseBody.error).to.equal(testCase.error);
        }
    });
});
