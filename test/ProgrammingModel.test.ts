// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import { expect } from 'chai';
import { spawnSync } from 'child_process';
import * as path from 'path';

const repoRoot = path.resolve(__dirname, '..');

describe('ProgrammingModel', () => {
    it('merges custom capabilities, advertises an absolute loopback HttpUri, and locks setup', function () {
        this.timeout(10_000);
        const result = runSnippet(`
const { setup } = require('./src/setup');
const { ProgrammingModel } = require('./src/ProgrammingModel');

(async () => {
    setup({
        enableHttpStream: true,
        capabilities: {
            customCapability: true,
            stringCapability: 'customValue',
        },
    });

    const model = new ProgrammingModel();
    const capabilities = await model.getCapabilities({ existingCapability: 'existingValue' });

    let lockError;
    try {
        setup({ capabilities: { afterStartup: 'blocked' } });
    } catch (err) {
        lockError = err instanceof Error ? err.message : String(err);
    }

    await new Promise((resolve, reject) =>
        process.stdout.write(JSON.stringify({ capabilities, lockError }) + '\\n', (err) =>
            err ? reject(err) : resolve()
        )
    );
    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
        `) as {
            capabilities: Record<string, string>;
            lockError?: string;
        };

        expect(result.capabilities.existingCapability).to.equal('existingValue');
        expect(result.capabilities.customCapability).to.equal('true');
        expect(result.capabilities.stringCapability).to.equal('customValue');
        const httpUriValue = result.capabilities.HttpUri;
        expect(httpUriValue).to.be.a('string');

        const httpUri = new URL(httpUriValue!);
        expect(httpUri.protocol).to.equal('http:');
        expect(httpUri.pathname).to.equal('/');
        expect(httpUri.hostname).to.satisfy((value: string) =>
            ['127.0.0.1', '::1'].includes(value.replace(/^\[(.*)\]$/, '$1'))
        );
        expect(httpUri.port).to.not.equal('');

        expect(result.lockError).to.equal("Setup options can't be changed after app startup has finished.");
    });

    it('keeps non-streaming capability negotiation on the gRPC path', () => {
        const result = runSnippet(`
const { setup } = require('./src/setup');
const { ProgrammingModel } = require('./src/ProgrammingModel');

(async () => {
    setup({
        capabilities: {
            customCapability: false,
        },
    });

    const model = new ProgrammingModel();
    const capabilities = await model.getCapabilities({ existingCapability: 'existingValue' });

    await new Promise((resolve, reject) =>
        process.stdout.write(JSON.stringify(capabilities) + '\\n', (err) => (err ? reject(err) : resolve()))
    );
    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
        `) as Record<string, string>;

        expect(result).to.deep.equal({
            existingCapability: 'existingValue',
            customCapability: 'false',
        });
    });
});

function runSnippet(source: string): unknown {
    const result = spawnSync(process.execPath, ['-r', 'ts-node/register', '-e', source], {
        cwd: repoRoot,
        encoding: 'utf8',
    });

    if (result.error) {
        throw result.error;
    }

    const output = [result.stdout, result.stderr].filter(Boolean).join('\n');
    expect(result.status, output).to.equal(0);

    const lines = result.stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    expect(lines, output).to.not.be.empty;

    return JSON.parse(lines[lines.length - 1]!);
}
