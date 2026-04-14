// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

/**
 * Symbol used internally to mark a class/type as an MCP content type.
 * This allows runtime detection of types that should be serialized as structured content.
 * @internal
 */
const MCP_CONTENT_MARKER = Symbol('__mcp_content__');

type Constructor<T = unknown> = new (...args: any[]) => T;

/**
 * Marks a class or constructor function as an MCP result type that should be serialized
 * as structured content.
 *
 * When a function returns an instance of a type decorated with this marker,
 * the result will be serialized as both text content (for backwards compatibility)
 * and structured content (for clients that support it).
 *
 * Example:
 * ```typescript
 * @McpContent
 * class ImageMetadata {
 *   constructor(public imageId: string, public format: string, public tags: string[]) {}
 * }
 *
 * // Or programmatic form (without experimentalDecorators):
 * McpContent(ImageMetadata);
 * ```
 *
 * Supported forms:
 * - `@McpContent`
 * - `@McpContent()`
 * - `McpContent(MyClass)`
 *
 * @param target - Optional class or constructor function to mark for structured content.
 * @returns The target class/function or a class decorator.
 */
export function McpContent<T extends Constructor>(target: T): T;
export function McpContent(): <T extends Constructor>(target: T) => T;
export function McpContent<T extends Constructor>(target?: T): T | (<U extends Constructor>(target: U) => U) {
    const applyMarker = <U extends Constructor>(ctor: U): U => {
        Object.defineProperty(ctor.prototype, MCP_CONTENT_MARKER, {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false,
        });
        return ctor;
    };

    if (target === undefined) {
        return applyMarker;
    }

    return applyMarker(target);
}

/**
 * Checks if an object's type/class is marked as an MCP content type.
 *
 * @param obj - The object or class to check.
 * @returns True if the object is marked for structured content; otherwise, false.
 * @internal
 */
export function hasMcpContentMarker(obj: unknown): boolean {
    if (obj === null || obj === undefined) {
        return false;
    }

    // Constructor function: check its prototype directly
    if (typeof obj === 'function') {
        return (
            typeof (obj as { prototype?: unknown }).prototype === 'object' &&
            (obj as { prototype: object }).prototype !== null &&
            MCP_CONTENT_MARKER in (obj as { prototype: object }).prototype
        );
    }

    // Instance: the Symbol will be found on the prototype chain
    if (typeof obj === 'object') {
        return MCP_CONTENT_MARKER in obj;
    }

    return false;
}

/**
 * Determines whether structured content should be created for the given object.
 *
 * Returns true only when the object's class is explicitly marked with @McpContent.
 * This follows the marker/decorator pattern used by MCP SDKs:
 * - Plain objects / interfaces without the marker → text content only
 * - Class instances marked with McpContent(MyClass) → text + structuredContent
 *
 * @param obj - The object to evaluate.
 * @returns True if structured content should be emitted; otherwise, false.
 * @internal
 */
export function shouldCreateStructuredContentMarker(obj: unknown): boolean {
    if (obj === null || obj === undefined) {
        return false;
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        return false;
    }

    if (Array.isArray(obj)) {
        return false;
    }

    if (
        obj instanceof Date ||
        obj instanceof RegExp ||
        obj instanceof ArrayBuffer ||
        ArrayBuffer.isView(obj) ||
        Buffer.isBuffer(obj) ||
        obj instanceof Set ||
        obj instanceof Map
    ) {
        return false;
    }

    return hasMcpContentMarker(obj);
}
