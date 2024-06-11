// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { readdirSync } from 'fs-extra';
import * as parseArgs from 'minimist';

const args = parseArgs(process.argv.slice(2));
if (args.publishTag && args.dropPath) {
    validateRelease(args.publishTag, args.dropPath);
} else {
    console.log(`This script can be used to validate that a release tag and version are in an expected format

Example usage:

npm run validateRelease -- --publishTag preview --dropPath /example/path/`);
    throw new Error('Invalid arguments');
}

function validateRelease(publishTag: string, dropPath: string): void {
    const files = readdirSync(dropPath).filter((f) => f.endsWith('.tgz'));
    if (files.length !== 1) {
        throw new Error('Drop path should have one tgz file');
    }

    const match = files[0]?.match(/^azure-functions-(.*)\.tgz$/);
    if (!match || !match[1]) {
        throw new Error(`Unrecognized tgz file name "${files[0]}"`);
    }

    const versionNumber = match[1];
    let regex: RegExp;
    let expectedFormat: string;
    switch (publishTag) {
        case 'preview':
            regex = /^[0-9]+\.[0-9]+\.[0-9]+-alpha\.[0-9]+$/;
            expectedFormat = 'x.x.x-alpha.x';
            break;
        case 'latest':
        case 'legacy':
            regex = /^[0-9]+\.[0-9]+\.[0-9]+$/;
            expectedFormat = 'x.x.x';
            break;
        default:
            throw new Error(`Unrecognized publish tag "${publishTag}"`);
    }
    if (!regex.test(versionNumber)) {
        throw new Error(
            `Version number for tag "${publishTag}" should be in format "${expectedFormat}". Instead got "${versionNumber}"`
        );
    }
}
