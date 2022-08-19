// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcTypedData } from '@azure/functions-core';
import { expect } from 'chai';
import 'mocha';
import { convertKeysToCamelCase } from '../../src/converters/convertKeysToCamelCase';

describe('convertKeysToCamelCase', () => {
    it('normalizes common trigger metadata for HTTP', () => {
        const testData: { [k: string]: RpcTypedData } = {
            Headers: {
                json: JSON.stringify({ Connection: 'Keep-Alive' }),
            },
            Req: {
                http: { url: 'https://mock' },
            },
            Sys: {
                json: JSON.stringify({ MethodName: 'test-js', UtcNow: '2018', RandGuid: '3212' }),
            },
            $request: {
                string: 'Https://mock/',
            },
            falsyZero: {
                string: '0',
            },
            falsyFalse: {
                string: 'false',
            },
            falsyNull: {
                string: 'null',
            },
            falsyEmptyString: {
                string: '',
            },
            falsyUndefined: {
                string: undefined,
            },
        };

        const result = convertKeysToCamelCase(testData);
        expect(result.headers.connection).to.equal('Keep-Alive');
        expect(result.req.http.url).to.equal('https://mock');
        expect(result.sys.methodName).to.equal('test-js');
        expect(result.sys.utcNow).to.equal('2018');
        expect(result.sys.randGuid).to.equal('3212');
        expect(result.$request).to.equal('Https://mock/');
        expect(result.falsyZero).to.equal(0);
        expect(result.falsyFalse).to.equal(false);
        expect(result.falsyNull).to.equal(null);
        expect(result.falsyEmptyString.string).to.equal('');
        expect(result.falsyUndefined.string).to.equal(undefined);
        // Verify accessing original keys is undefined
        expect(result.Sys).to.be.undefined;
        expect(result.sys.UtcNow).to.be.undefined;
    });

    it('normalizes trigger metadata containing arrays', () => {
        const testData: { [k: string]: RpcTypedData } = {
            EnqueuedMessages: {
                json: JSON.stringify(['Hello 1', 'Hello 2']),
            },
            SequenceNumberArray: {
                json: JSON.stringify([1, 2]),
            },
            Properties: {
                json: JSON.stringify({ Greetings: ['Hola', 'Salut', 'Konichiwa'], SequenceNumber: [1, 2, 3] }),
            },
            Sys: {
                json: JSON.stringify({ MethodName: 'test-js', UtcNow: '2018', RandGuid: '3212' }),
            },
        };

        const result = convertKeysToCamelCase(testData);
        expect(Array.isArray(result.enqueuedMessages)).to.be.true;
        expect(result.enqueuedMessages.length).to.equal(2);
        expect(result.enqueuedMessages[1]).to.equal('Hello 2');
        expect(Array.isArray(result.sequenceNumberArray)).to.be.true;
        expect(result.sequenceNumberArray.length).to.equal(2);
        expect(result.sequenceNumberArray[0]).to.equal(1);
        expect(result.sys.methodName).to.equal('test-js');
        expect(result.sys.utcNow).to.equal('2018');
        expect(result.sys.randGuid).to.equal('3212');
        // Verify that nested arrays are converted correctly
        const properties = result.properties;
        expect(Array.isArray(properties.greetings)).to.be.true;
        expect(properties.greetings.length).to.equal(3);
        expect(properties.greetings[1]).to.equal('Salut');
        expect(Array.isArray(properties.sequenceNumber)).to.be.true;
        expect(properties.sequenceNumber.length).to.equal(3);
        expect(properties.sequenceNumber[0]).to.equal(1);
        // Verify accessing original keys is undefined
        expect(result.Sys).to.be.undefined;
        expect(result.sys.UtcNow).to.be.undefined;
    });
});
