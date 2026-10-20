# Azure Functions Node.js Programming Model

|Branch|Status|Support level|Node.js Versions|
|---|---|---|---|
|v4.x (default)|[![Build Status](https://img.shields.io/azure-devops/build/azfunc/public/514/v4.x)](https://azfunc.visualstudio.com/public/_build/latest?definitionId=514&branchName=v4.x) [![Test Status](https://img.shields.io/azure-devops/tests/azfunc/public/514/v4.x?compact_message)](https://azfunc.visualstudio.com/public/_build/latest?definitionId=514&branchName=v4.x)|GA|24, 22|
|v3.x|[![Build Status](https://img.shields.io/azure-devops/build/azfunc/public/514/v3.x)](https://azfunc.visualstudio.com/public/_build/latest?definitionId=514&branchName=v3.x) [![Test Status](https://img.shields.io/azure-devops/tests/azfunc/public/514/v3.x?compact_message)](https://azfunc.visualstudio.com/public/_build/latest?definitionId=514&branchName=v3.x)|GA|24, 22|

## Install

```bash
npm install @azure/functions
```

## Documentation

- [Azure Functions JavaScript Developer Guide](https://learn.microsoft.com/azure/azure-functions/functions-reference-node?pivots=nodejs-model-v4)
- [Upgrade guide from v3 to v4](https://learn.microsoft.com/azure/azure-functions/functions-node-upgrade-v4)
- [Create your first TypeScript function](https://docs.microsoft.com/azure/azure-functions/create-first-function-vs-code-typescript?pivots=nodejs-model-v4)
- [Create your first JavaScript function](https://docs.microsoft.com/azure/azure-functions/create-first-function-vs-code-node?pivots=nodejs-model-v4)

## Considerations

- The Node.js "programming model" shouldn't be confused with the Azure Functions "runtime".
  - _**Programming model**_: Defines how you author your code and is specific to JavaScript and TypeScript.
  - _**Runtime**_: Defines underlying behavior of Azure Functions and is shared across all languages.
- The programming model version is strictly tied to the version of the [`@azure/functions`](https://www.npmjs.com/package/@azure/functions) npm package, and is versioned independently of the [runtime](https://learn.microsoft.com/azure/azure-functions/functions-versions?pivots=programming-language-javascript). Both the runtime and the programming model use "4" as their latest major version, but that is purely a coincidence.
- You can't mix the v3 and v4 programming models in the same function app. As soon as you register one v4 function in your app, any v3 functions registered in _function.json_ files are ignored.
- By default, trigger metadata strings will be converted to JSON if they can successfully be interpreted as JSON. This behavior can be disabled by setting the `enablePlainRpcStrings` option to `true` in the setup.

### Connector trigger TypeScript compatibility in 4.17.0

Version 4.17.0 adds explicitly typed polling and batching properties to `ConnectorTriggerOptions` and `ConnectorTriggerFunctionOptions`.
Previously, these properties were accepted through a `Record<string, unknown>` index signature.
This tightens the TypeScript contract and can cause existing code to fail compilation, even when the configuration values are valid at runtime.
Custom properties remain supported.

In particular, TypeScript widens properties in an unannotated configuration variable to `string`:

```typescript
import { trigger } from '@azure/functions';

const options = { deliveryMode: 'Webhook' };
// No longer compiles: string is not assignable to 'Poll' | 'Webhook'.
trigger.connectorTrigger(options);
```

Annotate configuration variables with the exported options type:

```typescript
import { trigger, type ConnectorTriggerOptions } from '@azure/functions';

const options: ConnectorTriggerOptions = { deliveryMode: 'Webhook' };
trigger.connectorTrigger(options);
```

For `app.connectorTrigger`, use `ConnectorTriggerFunctionOptions<T>` for a configuration variable that includes a handler.
Alternatively, preserve literal types using `as const`, or pass the options object directly to the API.
Use the exact values `'Poll'` or `'Webhook'` for `deliveryMode`, and `'one'` or `'many'` for `cardinality`.
The connection and trigger configuration names must be strings; batch size, concurrency, and scaling threshold overrides must be numbers.
Poll delivery also now checks at registration that both `connection` and `triggerConfigName` are supplied.

## Usage

### TypeScript

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function httpTrigger1(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
};

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger1
});
```

### JavaScript

```javascript
const { app } = require('@azure/functions');

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { body: `Hello, ${name}!` };
    }
});
```
