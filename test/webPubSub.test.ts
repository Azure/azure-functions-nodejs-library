// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { input, trigger } from '../src';

describe('trigger.webPubSub', () => {
    it('converts singular connection to connections array', () => {
        const result = trigger.webPubSub({
            name: 'request',
            hub: 'testHub',
            eventType: 'user',
            eventName: 'message',
            connection: 'MyConn',
        });

        expect(result.connections).to.deep.equal(['MyConn']);
        expect(result).to.not.have.property('connection');
    });

    it('preserves connections when provided', () => {
        const result = trigger.webPubSub({
            name: 'request',
            hub: 'testHub',
            eventType: 'user',
            eventName: 'message',
            connections: ['Conn1', 'Conn2'],
        });

        expect(result.connections).to.deep.equal(['Conn1', 'Conn2']);
    });

    it('prefers connections over connection when both provided', () => {
        const result = trigger.webPubSub({
            name: 'request',
            hub: 'testHub',
            eventType: 'user',
            eventName: 'message',
            connections: ['FromConnections'],
            connection: 'FromConnection',
        });

        expect(result.connections).to.deep.equal(['FromConnections']);
        expect(result).to.not.have.property('connection');
    });

    it('leaves connections undefined when neither provided', () => {
        const result = trigger.webPubSub({
            name: 'request',
            hub: 'testHub',
            eventType: 'user',
            eventName: 'message',
        });

        expect(result.connections).to.be.undefined;
    });

    it('preserves other trigger properties', () => {
        const result = trigger.webPubSub({
            name: 'request',
            hub: 'testHub',
            eventType: 'user',
            eventName: 'message',
            connection: 'MyConn',
        });

        expect(result.hub).to.equal('testHub');
        expect(result.eventType).to.equal('user');
        expect(result.eventName).to.equal('message');
        expect(result.type).to.equal('webPubSubTrigger');
    });
});

describe('input.webPubSubContext', () => {
    it('converts singular connection to connections array', () => {
        const result = input.webPubSubContext({
            name: 'wpsContext',
            connection: 'MyConn',
        });

        expect(result.connections).to.deep.equal(['MyConn']);
        expect(result).to.not.have.property('connection');
    });

    it('preserves connections when provided', () => {
        const result = input.webPubSubContext({
            name: 'wpsContext',
            connections: ['Conn1', 'Conn2'],
        });

        expect(result.connections).to.deep.equal(['Conn1', 'Conn2']);
    });

    it('prefers connections over connection when both provided', () => {
        const result = input.webPubSubContext({
            name: 'wpsContext',
            connections: ['FromConnections'],
            connection: 'FromConnection',
        });

        expect(result.connections).to.deep.equal(['FromConnections']);
        expect(result).to.not.have.property('connection');
    });

    it('leaves connections undefined when neither provided', () => {
        const result = input.webPubSubContext({
            name: 'wpsContext',
        });

        expect(result.connections).to.be.undefined;
    });

    it('preserves other input properties', () => {
        const result = input.webPubSubContext({
            name: 'wpsContext',
            connection: 'MyConn',
        });

        expect(result.type).to.equal('webPubSubContext');
        expect(result.name).to.equal('wpsContext');
    });
});
