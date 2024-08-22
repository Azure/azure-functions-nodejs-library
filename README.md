# Azure Functions Node.js Programming Model

|Branch|Status|Support level|Node.js Versions|
|---|---|---|---|
|v4.x (default)|[![Build Status](https://img.shields.io/azure-devops/build/azfunc/public/514/v4.x)](https://azfunc.visualstudio.com/public/_build/latest?definitionId=514&branchName=v4.x) [![Test Status](https://img.shields.io/azure-devops/tests/azfunc/public/514/v4.x?compact_message)](https://azfunc.visualstudio.com/public/_build/latest?definitionId=514&branchName=v4.x)|GA|20, 18|
|v3.x|[![Build Status](https://img.shields.io/azure-devops/build/azfunc/public/514/v3.x)](https://azfunc.visualstudio.com/public/_build/latest?definitionId=514&branchName=v3.x) [![Test Status](https://img.shields.io/azure-devops/tests/azfunc/public/514/v3.x?compact_message)](https://azfunc.visualstudio.com/public/_build/latest?definitionId=514&branchName=v3.x)|GA|20, 18|

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
