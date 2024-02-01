// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import * as crypto from 'crypto';

export function getRandomHexString(length = 10): string {
    const buffer: Buffer = crypto.randomBytes(Math.ceil(length / 2));
    return buffer.toString('hex').slice(0, length);
}

export function getStringHash(data: string, length = 10): string {
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, length);
}
