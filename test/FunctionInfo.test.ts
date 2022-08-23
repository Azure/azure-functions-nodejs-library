// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcFunctionMetadata } from '@azure/functions-core';
import { expect } from 'chai';
import 'mocha';
import { FunctionInfo } from '../src/FunctionInfo';

describe('FunctionInfo', () => {
    /** NullableBool */
    it('gets $return output binding converter for http', () => {
        const metadata: RpcFunctionMetadata = {
            bindings: {
                req: {
                    type: 'httpTrigger',
                    direction: 'in',
                    dataType: 'string',
                },
                $return: {
                    type: 'http',
                    direction: 'out',
                    dataType: 'string',
                },
            },
        };

        const funcInfo = new FunctionInfo(metadata);
        expect(funcInfo.getReturnBinding().converter.name).to.equal('toRpcHttp');
    });

    it('"hasHttpTrigger" is true for http', () => {
        const metadata: RpcFunctionMetadata = {
            bindings: {
                req: {
                    type: 'httpTrigger',
                    direction: 'in',
                    dataType: 'string',
                },
            },
        };

        const funcInfo = new FunctionInfo(metadata);
        expect(funcInfo.getReturnBinding()).to.be.undefined;
        expect(funcInfo.hasHttpTrigger).to.be.true;
    });

    it('gets $return output binding converter for TypedData', () => {
        const metadata: RpcFunctionMetadata = {
            bindings: {
                input: {
                    type: 'queue',
                    direction: 'in',
                    dataType: 'string',
                },
                $return: {
                    type: 'queue',
                    direction: 'out',
                    dataType: 'string',
                },
            },
        };
        const funcInfo = new FunctionInfo(metadata);
        expect(funcInfo.getReturnBinding().converter.name).to.equal('toTypedData');
    });
});
