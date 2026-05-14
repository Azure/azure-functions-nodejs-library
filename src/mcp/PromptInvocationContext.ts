// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

/**
 * Structured context object passed to MCP prompt handlers.
 *
 * Provides typed access to the invoked prompt's name, arguments (all values are strings),
 * optional session id, and optional transport metadata. Can be constructed either from
 * a parsed object or from a JSON string — both shapes are emitted by the MCP extension
 * depending on trigger metadata wiring.
 */
export class PromptInvocationContext {
    readonly name: string;
    readonly arguments: Record<string, string>;
    readonly sessionId: string | undefined;
    readonly transport: Record<string, unknown> | undefined;

    constructor(data: unknown) {
        let obj: Record<string, unknown> = {};

        if (typeof data === 'string') {
            try {
                const parsed: unknown = JSON.parse(data);
                if (parsed && typeof parsed === 'object') {
                    obj = parsed as Record<string, unknown>;
                }
            } catch {
                obj = {};
            }
        } else if (data && typeof data === 'object') {
            obj = data as Record<string, unknown>;
        }

        this.name = typeof obj.name === 'string' ? obj.name : '';

        const args = obj.arguments;
        if (args && typeof args === 'object' && !Array.isArray(args)) {
            const out: Record<string, string> = {};
            for (const [k, v] of Object.entries(args as Record<string, unknown>)) {
                out[k] = typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v);
            }
            this.arguments = out;
        } else {
            this.arguments = {};
        }

        // Accept both `sessionId` and `sessionid` casings from the host payload.
        const sid = obj.sessionId ?? obj.sessionid;
        this.sessionId = typeof sid === 'string' ? sid : undefined;

        const transport = obj.transport;
        this.transport =
            transport && typeof transport === 'object' && !Array.isArray(transport)
                ? (transport as Record<string, unknown>)
                : undefined;
    }
}
