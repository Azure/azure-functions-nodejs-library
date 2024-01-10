// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Blob } from 'buffer';
import { ReadableStream } from 'stream/web';
import { BodyInit, FormData, Headers, HeadersInit } from 'undici';
import { URLSearchParams } from 'url';
import { FunctionOptions, FunctionOutput, FunctionResult, FunctionTrigger } from './index';
import { InvocationContext } from './InvocationContext';

export type HttpHandler = (
    request: HttpRequest,
    context: InvocationContext
) => FunctionResult<HttpResponseInit | HttpResponse>;

export interface HttpFunctionOptions extends HttpTriggerOptions, Partial<FunctionOptions> {
    handler: HttpHandler;

    trigger?: HttpTrigger;

    /**
     * Configuration for the optional primary output of the function. If not set, this will default to a standard http response output
     * This is the main output that you should set as the return value of the function handler during invocation
     */
    return?: FunctionOutput;
}

export type HttpMethodFunctionOptions = Omit<HttpFunctionOptions, 'methods'>;

export interface HttpTriggerOptions {
    /**
     * The function HTTP authorization level
     * Defaults to 'anonymous' if not specified
     */
    authLevel?: 'anonymous' | 'function' | 'admin';

    /**
     * An array of the http methods for this http input
     * Defaults to ["get", "post"] if not specified
     */
    methods?: HttpMethod[];

    /**
     * The route for this http input. If not specified, the function name will be used
     */
    route?: string;
}

export interface HttpTrigger extends FunctionTrigger {
    /**
     * The function HTTP authorization level.
     */
    authLevel: 'anonymous' | 'function' | 'admin';

    /**
     * An array of the http methods for this http input
     */
    methods: HttpMethod[];

    /**
     * The route for this http input. If not specified, the function name will be used
     */
    route?: string;
}

/**
 * At this point in time there are no http output specific options
 */
export interface HttpOutputOptions {}

export type HttpOutput = FunctionOutput & HttpOutputOptions;

/**
 * HTTP request object. Provided to your function when using HTTP Bindings.
 */
export declare class HttpRequest {
    /**
     * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
     */
    constructor(httpRequestInit: HttpRequestInit);

    /**
     * HTTP request method used to invoke this function.
     */
    readonly method: string;

    /**
     * Request URL.
     */
    readonly url: string;

    /**
     * HTTP request headers.
     */
    readonly headers: Headers;

    /**
     * Query string parameter keys and values from the URL.
     */
    readonly query: URLSearchParams;

    /**
     * Route parameter keys and values.
     */
    readonly params: HttpRequestParams;

    /**
     *  Object representing logged-in user, either through
     *  AppService/Functions authentication, or SWA Authentication
     *  null when no such user is logged in.
     */
    readonly user: HttpRequestUser | null;

    /**
     * Returns the body as a ReadableStream
     */
    readonly body: ReadableStream | null;

    /**
     * Returns whether the body has been read from
     */
    readonly bodyUsed: boolean;

    /**
     * Returns a promise fulfilled with the body as an ArrayBuffer
     */
    readonly arrayBuffer: () => Promise<ArrayBuffer>;

    /**
     * Returns a promise fulfilled with the body as a Blob
     */
    readonly blob: () => Promise<Blob>;

    /**
     * Returns a promise fulfilled with the body as FormData
     */
    readonly formData: () => Promise<FormData>;

    /**
     * Returns a promise fulfilled with the body parsed as JSON
     */
    readonly json: () => Promise<unknown>;

    /**
     * Returns a promise fulfilled with the body as a string
     */
    readonly text: () => Promise<string>;

    /**
     * Creates a copy of the request object, with special handling of the body.
     * [Learn more here](https://developer.mozilla.org/docs/Web/API/Request/clone)
     */
    readonly clone: () => HttpRequest;
}

/**
 * Route parameter keys and values.
 */
export type HttpRequestParams = Record<string, string>;

/**
 *  Object representing logged-in user, either through
 *  AppService/Functions authentication, or SWA Authentication
 */
export interface HttpRequestUser {
    /**
     * Type of authentication, either AppService or StaticWebApps
     */
    type: HttpRequestUserType;

    /**
     * unique user GUID
     */
    id: string;

    /**
     * unique username
     */
    username: string;

    /**
     * provider of authentication service
     */
    identityProvider: string;

    /**
     * Extra authentication information, dependent on auth type
     * and auth provider
     */
    claimsPrincipalData: Record<string, unknown>;
}

/**
 * Possible values for an HTTP request method.
 */
export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'HEAD' | 'PATCH' | 'PUT' | 'OPTIONS' | 'TRACE' | 'CONNECT';

/**
 * Possible values for an HTTP Request user type
 */
export type HttpRequestUserType = 'AppService' | 'StaticWebApps';

export interface HttpResponseInit {
    /**
     * HTTP response body
     */
    body?: BodyInit;

    /**
     * A JSON-serializable HTTP Response body.
     * If set, the `HttpResponseInit.body` property will be ignored in favor of this property
     */
    jsonBody?: any;

    /**
     * HTTP response status code
     * @default 200
     */
    status?: number;

    /**
     * HTTP response headers
     */
    headers?: HeadersInit;

    /**
     * HTTP response cookies
     */
    cookies?: Cookie[];

    /**
     * Enable content negotiation of response body if true
     * If false, treat response body as raw
     * @default false
     */
    enableContentNegotiation?: boolean;
}

/**
 * HTTP response class
 */
export declare class HttpResponse {
    constructor(responseInit?: HttpResponseInit);

    /**
     * HTTP response status code
     * @default 200
     */
    readonly status: number;

    /**
     * HTTP response headers.
     */
    readonly headers: Headers;

    /**
     * HTTP response cookies
     */
    readonly cookies: Cookie[];

    /**
     * Enable content negotiation of response body if true
     * If false, treat response body as raw
     * @default false
     */
    readonly enableContentNegotiation: boolean;

    /**
     * Returns the body as a ReadableStream
     */
    readonly body: ReadableStream | null;

    /**
     * Returns whether the body has been read from
     */
    readonly bodyUsed: boolean;

    /**
     * Returns a promise fulfilled with the body as an ArrayBuffer
     */
    readonly arrayBuffer: () => Promise<ArrayBuffer>;

    /**
     * Returns a promise fulfilled with the body as a Blob
     */
    readonly blob: () => Promise<Blob>;

    /**
     * Returns a promise fulfilled with the body as FormData
     */
    readonly formData: () => Promise<FormData>;

    /**
     * Returns a promise fulfilled with the body parsed as JSON
     */
    readonly json: () => Promise<unknown>;

    /**
     * Returns a promise fulfilled with the body as a string
     */
    readonly text: () => Promise<string>;

    /**
     * Creates a copy of the response object, with special handling of the body.
     * [Learn more here](https://developer.mozilla.org/docs/Web/API/Response/clone)
     */
    readonly clone: () => HttpResponse;
}

/**
 * Http response cookie object to "Set-Cookie"
 */
export interface Cookie {
    name: string;

    value: string;

    /**
     * Specifies allowed hosts to receive the cookie
     */
    domain?: string;

    /**
     * Specifies URL path that must exist in the requested URL
     */
    path?: string;

    /**
     * NOTE: It is generally recommended that you use maxAge over expires.
     * Sets the cookie to expire at a specific date instead of when the client closes.
     * This can be a Javascript Date or Unix time in milliseconds.
     */
    expires?: Date | number;

    /**
     * Sets the cookie to only be sent with an encrypted request
     */
    secure?: boolean;

    /**
     * Sets the cookie to be inaccessible to JavaScript's Document.cookie API
     */
    httpOnly?: boolean;

    /**
     * Can restrict the cookie to not be sent with cross-site requests
     */
    sameSite?: 'Strict' | 'Lax' | 'None' | undefined;

    /**
     * Number of seconds until the cookie expires. A zero or negative number will expire the cookie immediately.
     */
    maxAge?: number;
}

/**
 * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
 */
export interface HttpRequestInit {
    method?: string;

    url?: string;

    body?: HttpRequestBodyInit;

    headers?: Record<string, string>;

    query?: Record<string, string>;

    params?: Record<string, string>;
}

/**
 * For testing purposes only. This will always be constructed for you when run in the context of the Azure Functions runtime
 */
export interface HttpRequestBodyInit {
    /**
     * The body as a buffer. You only need to specify one of the `bytes` or `string` properties
     */
    bytes?: Uint8Array;

    /**
     * The body as a string. You only need to specify one of the `bytes` or `string` properties
     */
    string?: string;
}
