// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

/**
 * Based off of the Node worker
 * https://github.com/Azure/azure-functions-nodejs-worker/blob/bf28d9c5ad4ed22c5e42c082471d16108abee140/src/Disposable.ts
 */
export class Disposable {
    static from(...inDisposables: { dispose(): any }[]): Disposable {
        let disposables: ReadonlyArray<{ dispose(): any }> | undefined = inDisposables;
        return new Disposable(function () {
            if (disposables) {
                for (const disposable of disposables) {
                    if (disposable && typeof disposable.dispose === 'function') {
                        disposable.dispose();
                    }
                }
                disposables = undefined;
            }
        });
    }

    #callOnDispose?: () => any;

    constructor(callOnDispose: () => any) {
        this.#callOnDispose = callOnDispose;
    }

    dispose(): any {
        if (this.#callOnDispose instanceof Function) {
            this.#callOnDispose();
            this.#callOnDispose = undefined;
        }
    }
}
