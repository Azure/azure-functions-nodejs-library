// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { RpcTypedData } from '@azure/functions-core';
import { expect } from 'chai';
import 'mocha';
import { fromRpcTriggerMetadata } from '../../src/converters/fromRpcTriggerMetadata';

interface RpcTypedDataExtended extends RpcTypedData {
    data: string;
}

describe('fromRpcTriggerMetadata', () => {
    it('httpTrigger', () => {
        const testData: Record<string, RpcTypedDataExtended> = {
            Query: {
                json: '{}',
                data: 'json',
                http: undefined,
            },
            Headers: {
                json: '{"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","Connection":"keep-alive","Host":"localhost:7071","User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36","Accept-Encoding":"gzip, deflate, br","Accept-Language":"en-US,en;q=0.9","Upgrade-Insecure-Requests":"1","sec-ch-ua":"\\"Chromium\\";v=\\"104\\", \\" Not A;Brand\\";v=\\"99\\", \\"Google Chrome\\";v=\\"104\\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\\"macOS\\"","Sec-Fetch-Site":"none","Sec-Fetch-Mode":"navigate","Sec-Fetch-User":"?1","Sec-Fetch-Dest":"document"}',
                data: 'json',
                http: undefined,
            },
        };

        expect(fromRpcTriggerMetadata(testData, 'httpTrigger')).to.be.undefined;
    });

    it('timerTrigger', () => {
        const testData: Record<string, RpcTypedDataExtended> = {
            TimerTrigger: {
                string: '8/24/2022 10:05:00 PM',
                data: 'string',
                http: undefined,
            },
        };

        expect(fromRpcTriggerMetadata(testData, 'timerTrigger')).to.be.undefined;
    });

    it('serviceBusTrigger', () => {
        const testData: Record<string, RpcTypedDataExtended> = {
            MessageReceiver: {
                json: '{"RegisteredPlugins":[],"ReceiveMode":0,"PrefetchCount":0,"LastPeekedSequenceNumber":0,"Path":"helloWorldTopic/Subscriptions/helloWorldSub","OperationTimeout":"00:01:00","ServiceBusConnection":{"Endpoint":"sb://testservicebus.servicebus.windows.net","OperationTimeout":"00:01:00","RetryPolicy":{"MinimalBackoff":"00:00:00","MaximumBackoff":"00:00:30","DeltaBackoff":"00:00:03","MaxRetryCount":5,"IsServerBusy":false,"ServerBusyExceptionMessage":null},"TransportType":0,"TokenProvider":{},"IsClosedOrClosing":false},"IsClosedOrClosing":false,"OwnsConnection":true,"ClientId":"MessageReceiver2helloWorldTopic/Subscriptions/helloWorldSub","RetryPolicy":{"MinimalBackoff":"00:00:00","MaximumBackoff":"00:00:30","DeltaBackoff":"00:00:03","MaxRetryCount":5,"IsServerBusy":false,"ServerBusyExceptionMessage":null}}',
                data: 'json',
                http: undefined,
            },
            DeliveryCount: {
                json: '1',
                data: 'json',
                http: undefined,
            },
            LockToken: {
                string: '00000000-0000-0000-0000-000000000000',
                data: 'string',
                http: undefined,
            },
            ExpiresAtUtc: {
                json: '"2022-09-08T05:06:39.775Z"',
                data: 'json',
                http: undefined,
            },
            EnqueuedTimeUtc: {
                json: '"2022-08-25T05:06:39.775Z"',
                data: 'json',
                http: undefined,
            },
            MessageId: {
                string: 'a11f788b439b4c5daa6a9f173bf78d68',
                data: 'string',
                http: undefined,
            },
            ContentType: {
                string: 'text/plain',
                data: 'string',
                http: undefined,
            },
            SequenceNumber: {
                json: '17',
                data: 'json',
                http: undefined,
            },
            UserProperties: {
                json: '{"$AzureWebJobsParentId":"4cad516d-0081-4fa8-8ddb-2f898c664d2b"}',
                data: 'json',
                http: undefined,
            },
            name: {
                string: 'world',
                data: 'string',
                http: undefined,
            },
        };

        expect(fromRpcTriggerMetadata(testData, 'serviceBusTrigger')).to.deep.equal({
            messageReceiver: {
                registeredPlugins: [],
                receiveMode: 0,
                prefetchCount: 0,
                lastPeekedSequenceNumber: 0,
                path: 'helloWorldTopic/Subscriptions/helloWorldSub',
                operationTimeout: '00:01:00',
                serviceBusConnection: {
                    endpoint: 'sb://testservicebus.servicebus.windows.net',
                    operationTimeout: '00:01:00',
                    retryPolicy: {
                        minimalBackoff: '00:00:00',
                        maximumBackoff: '00:00:30',
                        deltaBackoff: '00:00:03',
                        maxRetryCount: 5,
                        isServerBusy: false,
                        serverBusyExceptionMessage: null,
                    },
                    transportType: 0,
                    tokenProvider: {},
                    isClosedOrClosing: false,
                },
                isClosedOrClosing: false,
                ownsConnection: true,
                clientId: 'MessageReceiver2helloWorldTopic/Subscriptions/helloWorldSub',
                retryPolicy: {
                    minimalBackoff: '00:00:00',
                    maximumBackoff: '00:00:30',
                    deltaBackoff: '00:00:03',
                    maxRetryCount: 5,
                    isServerBusy: false,
                    serverBusyExceptionMessage: null,
                },
            },
            deliveryCount: 1,
            lockToken: '00000000-0000-0000-0000-000000000000',
            expiresAtUtc: '2022-09-08T05:06:39.775Z',
            enqueuedTimeUtc: '2022-08-25T05:06:39.775Z',
            messageId: 'a11f788b439b4c5daa6a9f173bf78d68',
            contentType: 'text/plain',
            sequenceNumber: 17,
            userProperties: {
                $AzureWebJobsParentId: '4cad516d-0081-4fa8-8ddb-2f898c664d2b',
            },
            name: 'world',
        });
    });

    it('queueTrigger', () => {
        const testData: Record<string, RpcTypedDataExtended> = {
            QueueTrigger: {
                string: '{\n  "name": "world"\n}',
                data: 'string',
                http: undefined,
            },
            DequeueCount: {
                json: '1',
                data: 'json',
                http: undefined,
            },
            ExpirationTime: {
                json: '"2022-09-01T05:06:39+00:00"',
                data: 'json',
                http: undefined,
            },
            Id: {
                string: '814b3b66-0200-4121-8ef3-405846a124bf',
                data: 'string',
                http: undefined,
            },
            InsertionTime: {
                json: '"2022-08-25T05:06:39+00:00"',
                data: 'json',
                http: undefined,
            },
            NextVisibleTime: {
                json: '"2022-08-25T05:16:40+00:00"',
                data: 'json',
                http: undefined,
            },
            PopReceipt: {
                string: 'AgAAAAMAAAAAAAAAY5ar20G42AE=',
                data: 'string',
                http: undefined,
            },
            name: {
                string: 'world',
                data: 'string',
                http: undefined,
            },
        };

        expect(fromRpcTriggerMetadata(testData, 'queueTrigger')).to.deep.equal({
            queueTrigger: { name: 'world' },
            dequeueCount: 1,
            expirationTime: '2022-09-01T05:06:39+00:00',
            id: '814b3b66-0200-4121-8ef3-405846a124bf',
            insertionTime: '2022-08-25T05:06:39+00:00',
            nextVisibleTime: '2022-08-25T05:16:40+00:00',
            popReceipt: 'AgAAAAMAAAAAAAAAY5ar20G42AE=',
            name: 'world',
        });
    });

    it('blobTrigger', () => {
        const testData: Record<string, RpcTypedDataExtended> = {
            BlobTrigger: {
                string: 'helloworldcontainer/hello-at-2022-08-25T05-06-38Z',
                data: 'string',
                http: undefined,
            },
            Uri: {
                json: '"https://test.blob.core.windows.net/helloworldcontainer/hello-at-2022-08-25T05-06-38Z"',
                data: 'json',
                http: undefined,
            },
            Properties: {
                json: '{"CacheControl":null,"ContentDisposition":null,"ContentEncoding":null,"ContentLanguage":null,"Length":16,"ContentMD5":"eCccQ+cRr78B979+7PwDNg==","ContentType":"application/octet-stream","ETag":"\\"0x8DA8657981E929A\\"","Created":"2022-08-25T05:06:39+00:00","LastModified":"2022-08-25T05:06:39+00:00","BlobType":2,"LeaseStatus":2,"LeaseState":1,"LeaseDuration":0,"PageBlobSequenceNumber":null,"AppendBlobCommittedBlockCount":null,"IsServerEncrypted":true,"EncryptionScope":null,"IsIncrementalCopy":false,"StandardBlobTier":0,"RehydrationStatus":null,"PremiumPageBlobTier":null,"BlobTierInferred":false,"BlobTierLastModifiedTime":null,"DeletedTime":null,"RemainingDaysBeforePermanentDelete":null}',
                data: 'json',
                http: undefined,
            },
            Metadata: {
                json: '{"AzureWebJobsParentId":"4cad516d-0081-4fa8-8ddb-2f898c664d2b"}',
                data: 'json',
                http: undefined,
            },
            name: {
                string: 'hello-at-2022-08-25T05-06-38Z',
                data: 'string',
                http: undefined,
            },
        };

        expect(fromRpcTriggerMetadata(testData, 'blobTrigger')).to.deep.equal({
            blobTrigger: 'helloworldcontainer/hello-at-2022-08-25T05-06-38Z',
            uri: 'https://test.blob.core.windows.net/helloworldcontainer/hello-at-2022-08-25T05-06-38Z',
            properties: {
                cacheControl: null,
                contentDisposition: null,
                contentEncoding: null,
                contentLanguage: null,
                length: 16,
                contentMD5: 'eCccQ+cRr78B979+7PwDNg==',
                contentType: 'application/octet-stream',
                eTag: '"0x8DA8657981E929A"',
                created: '2022-08-25T05:06:39+00:00',
                lastModified: '2022-08-25T05:06:39+00:00',
                blobType: 2,
                leaseStatus: 2,
                leaseState: 1,
                leaseDuration: 0,
                pageBlobSequenceNumber: null,
                appendBlobCommittedBlockCount: null,
                isServerEncrypted: true,
                encryptionScope: null,
                isIncrementalCopy: false,
                standardBlobTier: 0,
                rehydrationStatus: null,
                premiumPageBlobTier: null,
                blobTierInferred: false,
                blobTierLastModifiedTime: null,
                deletedTime: null,
                remainingDaysBeforePermanentDelete: null,
            },
            metadata: {
                azureWebJobsParentId: '4cad516d-0081-4fa8-8ddb-2f898c664d2b',
            },
            name: 'hello-at-2022-08-25T05-06-38Z',
        });
    });

    it('weird old bug with bytes as number', () => {
        // https://github.com/Azure/azure-functions-nodejs-worker/issues/607
        const testData: Record<string, RpcTypedDataExtended> = {
            A: {
                data: 'json',
                json: '{"B":{"bytes":4}}',
            },
        };

        expect(fromRpcTriggerMetadata(testData, 'testTrigger')).to.deep.equal({
            a: {
                b: {
                    bytes: 4,
                },
            },
        });
    });
});
