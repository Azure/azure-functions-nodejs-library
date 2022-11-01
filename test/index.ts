// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as globby from 'globby';
import * as Mocha from 'mocha';
import * as path from 'path';

export async function run(): Promise<void> {
    try {
        const options: Mocha.MochaOptions = {
            color: true,
            require: ['ts-node/register'],
            reporter: 'mocha-multi-reporters',
            reporterOptions: {
                reporterEnabled: 'spec, mocha-junit-reporter',
                mochaJunitReporterReporterOptions: {
                    mochaFile: path.resolve(__dirname, '..', 'test', 'unit-test-results.xml'),
                },
            },
        };

        addEnvVarsToMochaOptions(options);
        console.log(`Mocha options: ${JSON.stringify(options, undefined, 2)}`);

        const mocha = new Mocha(options);

        const files: string[] = await globby('**/**.test.ts', { cwd: __dirname });

        files.forEach((f) => mocha.addFile(path.resolve(__dirname, f)));

        const failures = await new Promise<number>((resolve) => mocha.run(resolve));
        if (failures > 0) {
            throw new Error(`${failures} tests failed.`);
        }
    } catch (err) {
        console.error(err);
        console.error('Test run failed');
        process.exit(1);
    }
}

function addEnvVarsToMochaOptions(options: Mocha.MochaOptions): void {
    for (const envVar of Object.keys(process.env)) {
        const match: RegExpMatchArray | null = envVar.match(/^mocha_(.+)/i);
        if (match) {
            const [, option] = match;
            let value: string | number = process.env[envVar] || '';
            if (typeof value === 'string' && !isNaN(parseInt(value))) {
                value = parseInt(value);
            }
            (<any>options)[option] = value;
        }
    }
}

void run();
