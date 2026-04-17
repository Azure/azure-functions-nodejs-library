// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

/**
 * Marks a class or constructor function as an MCP result type that should be serialized
 * as structured content.
 *
 * When a function returns an instance of a type decorated with this marker,
 * the result will be serialized as both text content (for backwards compatibility)
 * and structured content (for clients that support it).
 *
 * Without the marker, a plain object is serialized as text-only (JSON stringified).
 * Use `McpToolResponse` if you need explicit control over structuredContent without a class.
 *
 * **Programmatic usage** (works without `experimentalDecorators`):
 * ```typescript
 * class ImageMetadata {
 *   constructor(public imageId: string, public format: string) {}
 * }
 * McpContent(ImageMetadata);  // marks the class
 *
 * app.mcpTool('GetImage', {
 *   toolName: 'GetImage',
 *   description: 'Returns image info',
 *   handler: async () => new ImageMetadata('logo', 'png')
 * });
 * ```
 *
 * **Decorator usage** (requires `experimentalDecorators: true` in tsconfig):
 * ```typescript
 * @McpContent
 * class ImageMetadata { ... }
 * ```
 *
 * Supported forms:
 * - `@McpContent`
 * - `@McpContent()`
 * - `McpContent(MyClass)`
 *
 * @param target - Optional class or constructor function to mark for structured content.
 * @returns The target class/function unchanged or a class decorator.
 *
 * @see {@link McpToolResponse} - For explicit content blocks + structuredContent
 * @see {@link McpTextContent} - For returning single content blocks
 */
export function McpContent<T extends { new (...args: any[]): unknown }>(target: T): T;
export function McpContent(): <T extends { new (...args: any[]): unknown }>(target: T) => T;

/**
 * Checks if an object's type/class is marked with the @McpContent decorator.
 *
 * @param obj - The object or class constructor to check.
 * @returns True if the class was marked with `McpContent`; otherwise, false.
 * @internal
 */
export function hasMcpContentMarker(obj: unknown): boolean;

/**
 * Returns true only when `obj` is an instance of a class explicitly marked with
 * `McpContent` and is not a primitive, array, or built-in type.
 *
 * This follows the marker/decorator pattern used by MCP SDKs:
 * - Marked class instances   → true  → text + structuredContent emitted
 * - Plain objects / literals → false → text only
 *
 * @param obj - The value to evaluate.
 * @returns True if structured content should be emitted for this value.
 * @internal
 */
export function shouldCreateStructuredContentMarker(obj: unknown): boolean;
