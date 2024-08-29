// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { FunctionOptions, FunctionResult, FunctionTrigger, RetryOptions } from './index';
import { InvocationContext } from './InvocationContext';

export type KafkaHandler = (messages: unknown, context: InvocationContext) => FunctionResult;

export interface KafkaFunctionOptions extends KafkaTriggerOptions, Partial<FunctionOptions> {
    handler: KafkaHandler;

    trigger?: KafkaTrigger;

    /**
     * An optional retry policy to rerun a failed execution until either successful completion occurs or the maximum number of retries is reached.
     * Learn more [here](https://learn.microsoft.com/azure/azure-functions/functions-bindings-error-pages)
     */
    retry?: RetryOptions;
}

export interface KafkaTriggerOptions {
    /**
     * The list of Kafka brokers monitored by the trigger.
     */
    brokerList: [];

    /**
     * The topic monitored by the trigger.
     */
    topic: string;

    /**
     *  Indicates the cardinality of the trigger input. The supported values are ONE (default) and MANY. Use ONE when the input is a single message and MANY when the input is an array of messages. When you use MANY, you must also set a dataType.
     */
    cardinality?: 'ONE' | 'MANY';

    /**
     * Defines how Functions handles the parameter value. By default, the value is obtained as a string and Functions tries to deserialize the string to actual plain-old Java object (POJO). When string, the input is treated as just a string. When binary, the message is received as binary data, and Functions tries to deserialize it to an actual parameter type byte[].
     */
    dataType?: 'string' | 'binary';

    /**
     * Kafka consumer group used by the trigger.
     */
    consumerGroup?: string;

    /**
     * Schema of a generic record when using the Avro protocol.
     */
    avroSchema?: string;

    /**
     * The authentication mode when using Simple Authentication and Security Layer (SASL) authentication. The supported values are Gssapi, Plain (default), ScramSha256, ScramSha512.
     */
    authenticationMode?: 'Plain' | 'Gssapi' | 'ScramSha256' | 'ScramSha512';

    /**
     * The username for SASL authentication. Not supported when AuthenticationMode is Gssapi.
     */
    username?: string;

    /**
     * The password for SASL authentication. Not supported when AuthenticationMode is Gssapi.
     */
    password?: string;

    /**
     * The security protocol used when communicating with brokers. The supported values are plaintext (default), ssl, sasl_plaintext, sasl_ssl.
     */
    protocol?: 'plaintext' | 'ssl' | 'sasl_plaintext' | 'sasl_ssl';

    /**
     * Path to CA certificate file for verifying the broker's certificate.
     */
    sslCaLocation?: string;

    /**
     * Path to client's certificate file.
     */
    sslCertificateLocation?: string;

    /**
     * Path to client's private key (PEM) used for authentication.
     */
    sslKeyLocation?: string;

    /**
     * Password for client's certificate.
     */
    sslKeyPassword?: string;
}
export type KafkaTrigger = FunctionTrigger & KafkaTriggerOptions;
