// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { convertToMcpPromptTriggerOptionsToRpc } from '../../src/converters/toMcpPromptTriggerOptionsToRpc';
import { promptArg } from '../../src/mcp/McpPromptArgumentBuilder';
import { McpPromptTriggerOptions } from '../../types/mcpPrompt';

describe('convertToMcpPromptTriggerOptionsToRpc', () => {
    describe('required properties validation', () => {
        it('throws when promptName is missing', () => {
            expect(() => convertToMcpPromptTriggerOptionsToRpc({} as McpPromptTriggerOptions)).to.throw(
                'MCP Prompt trigger requires a valid "promptName" property.'
            );
        });

        it('throws when promptName is empty', () => {
            expect(() => convertToMcpPromptTriggerOptionsToRpc({ promptName: '   ' })).to.throw(
                'MCP Prompt trigger requires a valid "promptName" property.'
            );
        });
    });

    describe('promptArguments serialization', () => {
        it('emits "[]" when no arguments are supplied', () => {
            const result = convertToMcpPromptTriggerOptionsToRpc({ promptName: 'p' });
            expect(result.promptArguments).to.equal('[]');
        });

        it('emits "[]" for an empty fluent record', () => {
            const result = convertToMcpPromptTriggerOptionsToRpc({
                promptName: 'p',
                promptArguments: {},
            });
            expect(result.promptArguments).to.equal('[]');
        });

        it('serializes a single fluent argument with defaults (description set, required: false)', () => {
            const result = convertToMcpPromptTriggerOptionsToRpc({
                promptName: 'p',
                promptArguments: {
                    text: promptArg.describe('Input text'),
                },
            });
            const parsed = JSON.parse(result.promptArguments ?? '');
            expect(parsed).to.deep.equal([{ name: 'text', description: 'Input text', required: false }]);
        });

        it('serializes multiple fluent arguments with mixed required flags', () => {
            const result = convertToMcpPromptTriggerOptionsToRpc({
                promptName: 'code_review',
                promptArguments: {
                    code: promptArg.describe('Code to review').isRequired(),
                    language: promptArg.describe('Programming language'),
                },
            });
            const parsed = JSON.parse(result.promptArguments ?? '');
            expect(parsed).to.deep.equal([
                { name: 'code', description: 'Code to review', required: true },
                { name: 'language', description: 'Programming language', required: false },
            ]);
        });

        it('accepts the fluent record form matching the generate_docs sample', () => {
            const result = convertToMcpPromptTriggerOptionsToRpc({
                promptName: 'generate_docs',
                promptArguments: {
                    function_name: promptArg.describe('The function to document.').isRequired(),
                    style: promptArg.describe("Documentation style (e.g., 'concise', 'verbose')."),
                },
            });
            const parsed = JSON.parse(result.promptArguments ?? '');
            expect(parsed).to.deep.equal([
                { name: 'function_name', description: 'The function to document.', required: true },
                {
                    name: 'style',
                    description: "Documentation style (e.g., 'concise', 'verbose').",
                    required: false,
                },
            ]);
        });

        it('throws when a record value is not built with promptArg.describe(...)', () => {
            expect(() =>
                convertToMcpPromptTriggerOptionsToRpc({
                    promptName: 'p',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    promptArguments: { foo: { description: 'x' } as any },
                })
            ).to.throw(
                'MCP Prompt trigger "promptArguments" record values must be created with `promptArg.describe(...)`.'
            );
        });
    });

    describe('optional fields', () => {
        it('passes through title, description', () => {
            const result = convertToMcpPromptTriggerOptionsToRpc({
                promptName: 'p',
                title: 'Prompt Title',
                description: 'A prompt',
            });
            expect(result.title).to.equal('Prompt Title');
            expect(result.description).to.equal('A prompt');
        });

        it('validates metadata is a JSON string', () => {
            expect(() => convertToMcpPromptTriggerOptionsToRpc({ promptName: 'p', metadata: '{ not json' })).to.throw(
                'MCP Prompt trigger "metadata" must be a valid JSON string.'
            );
        });

        it('accepts valid metadata JSON', () => {
            const result = convertToMcpPromptTriggerOptionsToRpc({
                promptName: 'p',
                metadata: '{"version":"1.0"}',
            });
            expect(result.metadata).to.equal('{"version":"1.0"}');
        });

        it('validates icons is a JSON string', () => {
            expect(() => convertToMcpPromptTriggerOptionsToRpc({ promptName: 'p', icons: 'not json' })).to.throw(
                'MCP Prompt trigger "icons" must be a valid JSON string.'
            );
        });

        it('accepts valid icons JSON', () => {
            const icons = '[{"name":"code","url":"https://example.com/icon.png"}]';
            const result = convertToMcpPromptTriggerOptionsToRpc({ promptName: 'p', icons });
            expect(result.icons).to.equal(icons);
        });

        it('omits empty/whitespace-only metadata and icons', () => {
            const result = convertToMcpPromptTriggerOptionsToRpc({
                promptName: 'p',
                metadata: '   ',
                icons: '',
            });
            expect(result.metadata).to.equal(undefined);
            expect(result.icons).to.equal(undefined);
        });
    });
});
