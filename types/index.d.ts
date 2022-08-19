// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

declare module '@azure/functions' {
    /**
     * Sets the programming model contained in this package to be the one used by the Azure Functions worker
     */
    function setup(): void;

    /**
     * Interface for your Azure Function code. This function must be exported (via module.exports or exports)
     * and will execute when triggered. It is recommended that you declare this function as async, which
     * implicitly returns a Promise.
     * @param context Context object passed to your function from the Azure Functions runtime.
     * @param {any[]} args Optional array of input and trigger binding data. These binding data are passed to the
     * function in the same order that they are defined in function.json. Valid input types are string, HttpRequest,
     * and Buffer.
     * @returns Output bindings (optional). If you are returning a result from a Promise (or an async function), this
     * result will be passed to JSON.stringify unless it is a string, Buffer, ArrayBufferView, or number.
     */
    export type AzureFunction = (context: Context, ...args: any[]) => Promise<any> | void;

    /**
     * Context bindings object. Provided to your function binding data, as defined in function.json.
     */
    export interface ContextBindings {
        [name: string]: any;
    }
    /**
     * Metadata related to the input that triggered your function
     */
    export interface TriggerMetadata {
        [name: string]: any;
    }
    /**
     * The context object can be used for writing logs, reading data from bindings, and setting outputs. A context object is passed
     * to your function from the Azure Functions runtime on function invocation.
     */
    export interface Context {
        /**
         * A unique guid specific to this invocation
         */
        invocationId: string;

        /**
         * The name of the function that is being invoked
         */
        functionName: string;

        /**
         * Input and trigger binding data, as defined in function.json. Properties on this object are dynamically
         * generated and named based off of the "name" property in function.json.
         */
        bindings: ContextBindings;

        /**
         * Trigger metadata
         */
        triggerMetadata: TriggerMetadata;

        /**
         * TraceContext information to enable distributed tracing scenarios
         */
        traceContext?: TraceContext;

        /**
         * The retry context of the current function execution if the retry policy is defined
         */
        retryContext?: RetryContext;

        /**
         * Allows you to write streaming function logs. Calling directly allows you to write streaming function logs
         * at the default trace level.
         */
        log: Logger;

        /**
         * HTTP request object. Provided to your function when using HTTP Bindings.
         */
        req?: HttpRequest;

        /**
         * HTTP response object. Provided to your function when using HTTP Bindings.
         */
        res?: {
            [key: string]: any;
        };
    }
    /**
     * HTTP request headers.
     */
    export interface HttpRequestHeaders {
        [name: string]: string;
    }
    /**
     * HTTP response headers.
     */
    export interface HttpResponseHeaders {
        [name: string]: string;
    }
    /**
     * Query string parameter keys and values from the URL.
     */
    export interface HttpRequestQuery {
        [name: string]: string;
    }
    /**
     * Route parameter keys and values.
     */
    export interface HttpRequestParams {
        [name: string]: string;
    }
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
        claimsPrincipalData: {
            [key: string]: any;
        };
    }
    /**
     * HTTP request object. Provided to your function when using HTTP Bindings.
     */
    export interface HttpRequest {
        /**
         * HTTP request method used to invoke this function.
         */
        method: HttpMethod | null;
        /**
         * Request URL.
         */
        url: string;
        /**
         * HTTP request headers.
         */
        headers: HttpRequestHeaders;
        /**
         * Query string parameter keys and values from the URL.
         */
        query: HttpRequestQuery;
        /**
         * Route parameter keys and values.
         */
        params: HttpRequestParams;
        /**
         *  Object representing logged-in user, either through
         *  AppService/Functions authentication, or SWA Authentication
         *  null when no such user is logged in.
         */
        user: HttpRequestUser | null;
        /**
         * The HTTP request body.
         */
        body?: any;
        /**
         * The HTTP request body as a UTF-8 string.
         */
        rawBody?: any;

        /**
         * Parses the body and returns an object representing a form
         * @throws if the content type is not "multipart/form-data" or "application/x-www-form-urlencoded"
         */
        parseFormBody(): Form;
    }

    export interface Form extends Iterable<[string, FormPart]> {
        /**
         * Returns the value of the first name-value pair whose name is `name`. If there are no such pairs, `null` is returned.
         */
        get(name: string): FormPart | null;

        /**
         * Returns the values of all name-value pairs whose name is `name`. If there are no such pairs, an empty array is returned.
         */
        getAll(name: string): FormPart[];

        /**
         * Returns `true` if there is at least one name-value pair whose name is `name`.
         */
        has(name: string): boolean;

        /**
         * The number of parts in this form
         */
        length: number;
    }

    export interface FormPart {
        /**
         * The value for this part of the form
         */
        value: Buffer;

        /**
         * The file name for this part of the form, if specified
         */
        fileName?: string;

        /**
         * The content type for this part of the form, assumed to be "text/plain" if not specified
         */
        contentType?: string;
    }

    /**
     * Possible values for an HTTP request method.
     */
    export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'HEAD' | 'PATCH' | 'PUT' | 'OPTIONS' | 'TRACE' | 'CONNECT';
    /**
     * Possible values for an HTTP Request user type
     */
    export type HttpRequestUserType = 'AppService' | 'StaticWebApps';
    /**
     * Http response object and methods.
     * This is the default of the res property in the Context object provided to your function when using HTTP triggers.
     */
    export interface HttpResponseFull {
        /**
         * HTTP response headers.
         */
        headers?: HttpResponseHeaders;
        /**
         *  HTTP response cookies.
         */
        cookies?: Cookie[];
        /**
         * HTTP response body.
         */
        body?: any;
        /**
         * HTTP response status code.
         * @default 200
         */
        statusCode?: number | string;
        /**
         * Enable content negotiation of response body if true
         * If false, treat response body as raw
         * @default false
         */
        enableContentNegotiation?: boolean;
        /**
         * Sets the HTTP response status code
         * @returns the updated HttpResponseFull instance
         */
        status: (statusCode: number | string) => HttpResponseFull;
        /**
         * Sets a particular header field to a value
         * @returns the updated HttpResponseFull instance
         */
        setHeader(field: string, val: any): HttpResponseFull;
        /**
         * Has the same functionality as setHeader.
         * Sets a particular header field to a value
         * @returns the updated HttpResponseFull instance
         */
        header(field: string, val: any): HttpResponseFull;
        /**
         * Has the same functionality as setHeader.
         * Sets a particular header field to a value
         * @returns the updated HttpResponseFull instance
         */
        set(field: string, val: any): HttpResponseFull;
        /**
         * Get the value of a particular header field
         */
        getHeader(field: string): any;
        /**
         * Has the same functionality as getHeader
         * Get the value of a particular header field
         */
        get(field: string): any;
        /**
         * Removes a particular header field
         * @returns the updated HttpResponseFull instance
         */
        removeHeader(field: string): HttpResponseFull;
        /**
         * Set the 'Content-Type' header to a particular value
         * @returns the updated HttpResponseFull instance
         */
        type(type: string): HttpResponseFull;
    }
    /**
     * Http response object.
     * This is not the default on the Context object, but you may replace context.res with an object of this type when using HTTP triggers.
     */
    export interface HttpResponseSimple {
        /**
         * HTTP response headers.
         */
        headers?: HttpResponseHeaders;
        /**
         *  HTTP response cookies.
         */
        cookies?: Cookie[];
        /**
         * HTTP response body.
         */
        body?: any;
        /**
         * HTTP response status code.
         * This property takes precedence over the `status` property
         * @default 200
         */
        statusCode?: number | string;
        /**
         * HTTP response status code
         * The same as `statusCode`. This property is ignored if `statusCode` is set
         * @default 200
         */
        status?: number | string;
        /**
         * Enable content negotiation of response body if true
         * If false, treat response body as raw
         * @default false
         */
        enableContentNegotiation?: boolean;
    }
    /**
     * Http response type.
     */
    export type HttpResponse = HttpResponseSimple | HttpResponseFull;

    /**
     * Http response cookie object to "Set-Cookie"
     */
    export interface Cookie {
        /** Cookie name */
        name: string;
        /** Cookie value */
        value: string;
        /** Specifies allowed hosts to receive the cookie */
        domain?: string;
        /** Specifies URL path that must exist in the requested URL */
        path?: string;
        /**
         * NOTE: It is generally recommended that you use maxAge over expires.
         * Sets the cookie to expire at a specific date instead of when the client closes.
         * This can be a Javascript Date or Unix time in milliseconds.
         */
        expires?: Date | number;
        /** Sets the cookie to only be sent with an encrypted request */
        secure?: boolean;
        /** Sets the cookie to be inaccessible to JavaScript's Document.cookie API */
        httpOnly?: boolean;
        /** Can restrict the cookie to not be sent with cross-site requests */
        sameSite?: 'Strict' | 'Lax' | 'None' | undefined;
        /** Number of seconds until the cookie expires. A zero or negative number will expire the cookie immediately. */
        maxAge?: number;
    }

    export interface RetryContext {
        /**
         * Current retry count of the function executions.
         */
        retryCount: number;

        /**
         * Max retry count is the maximum number of times an execution is retried before eventual failure. A value of -1 means to retry indefinitely.
         */
        maxRetryCount: number;

        /**
         * Exception that caused the retry
         */
        exception?: Exception;
    }

    export interface Exception {
        source?: string;

        stackTrace?: string;

        message?: string;
    }

    /**
     * TraceContext information to enable distributed tracing scenarios
     */
    export interface TraceContext {
        /**
         * Describes the position of the incoming request in its trace graph in a portable, fixed-length format
         */
        traceParent?: string | undefined;

        /**
         * Extends traceparent with vendor-specific data
         */
        traceState?: string | undefined;

        /**
         * Holds additional properties being sent as part of request telemetry
         */
        attributes?: { [k: string]: string };
    }

    export interface BindingDefinition {
        /**
         * The name of your binding, as defined in function.json.
         */
        name: string;
        /**
         * The type of your binding, as defined in function.json.
         */
        type: string;
        /**
         * The direction of your binding, as defined in function.json.
         */
        direction: 'in' | 'out' | 'inout' | undefined;
    }
    /**
     * Allows you to write streaming function logs.
     */
    export interface Logger {
        /**
         * Writes streaming function logs at the default trace level.
         */
        (...args: any[]): void;
        /**
         * Writes to error level logging or lower.
         */
        error(...args: any[]): void;
        /**
         * Writes to warning level logging or lower.
         */
        warn(...args: any[]): void;
        /**
         * Writes to info level logging or lower.
         */
        info(...args: any[]): void;
        /**
         * Writes to verbose level logging.
         */
        verbose(...args: any[]): void;
    }
    /**
     * Timer schedule information. Provided to your function when using a timer binding.
     */
    export interface Timer {
        /**
         * Whether this timer invocation is due to a missed schedule occurrence.
         */
        isPastDue: boolean;
        schedule: {
            /**
             * Whether intervals between invocations should account for DST.
             */
            adjustForDST: boolean;
        };
        scheduleStatus: {
            /**
             * The last recorded schedule occurrence. Date ISO string.
             */
            last: string;
            /**
             * The expected next schedule occurrence. Date ISO string.
             */
            next: string;
            /**
             * The last time this record was updated. This is used to re-calculate `next` with the current schedule after a host restart. Date ISO string.
             */
            lastUpdated: string;
        };
    }
}
