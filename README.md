# Azure Functions Node.js Programming Model

|Branch|Status|Support level|Node.js Versions|
|---|---|---|---|
|v4.x|[![Build Status](https://img.shields.io/azure-devops/build/azfunc/Azure%2520Functions/145/v4.x)](https://azfunc.visualstudio.com/Azure%20Functions/_build/latest?definitionId=145&branchName=v4.x) [![Test Status](https://img.shields.io/azure-devops/tests/azfunc/Azure%2520Functions/146/v4.x?compact_message)](https://azfunc.visualstudio.com/Azure%20Functions/_build/latest?definitionId=146&branchName=v4.x)|Preview|18|
|v3.x (default)|[![Build Status](https://img.shields.io/azure-devops/build/azfunc/Azure%2520Functions/145/v3.x)](https://azfunc.visualstudio.com/Azure%20Functions/_build/latest?definitionId=145&branchName=v3.x) [![Test Status](https://img.shields.io/azure-devops/tests/azfunc/Azure%2520Functions/146/v3.x?compact_message)](https://azfunc.visualstudio.com/Azure%20Functions/_build/latest?definitionId=146&branchName=v3.x)|GA (Recommended)|18, 16, 14|

## Install

```bash
npm install @azure/functions@preview
```

## Documentation

- [Azure Functions JavaScript Developer Guide](https://learn.microsoft.com/azure/azure-functions/functions-reference-node?pivots=nodejs-model-v4)
- [Upgrade guide from v3 to v4](https://learn.microsoft.com/azure/azure-functions/functions-node-upgrade-v4)
- [Create your first TypeScript function](https://docs.microsoft.com/azure/azure-functions/create-first-function-vs-code-typescript?pivots=nodejs-model-v4)
- [Create your first JavaScript function](https://docs.microsoft.com/azure/azure-functions/create-first-function-vs-code-node?pivots=nodejs-model-v4)

## Considerations

- During preview, the v4 model requires you to set the app setting `AzureWebJobsFeatureFlags` to `EnableWorkerIndexing`. For more information, see [Enable v4 programming model](https://learn.microsoft.com/azure/azure-functions/functions-reference-node?pivots=nodejs-model-v4#enable-v4-programming-model).
- The Node.js "programming model" shouldn't be confused with the Azure Functions "runtime".
  - _**Programming model**_: Defines how you author your code and is specific to JavaScript and TypeScript.
  - _**Runtime**_: Defines underlying behavior of Azure Functions and is shared across all languages.
- The programming model version is strictly tied to the version of the [`@azure/functions`](https://www.npmjs.com/package/@azure/functions) npm package, and is versioned independently of the [runtime](https://learn.microsoft.com/azure/azure-functions/functions-versions?pivots=programming-language-javascript). Both the runtime and the programming model use "4" as their latest major version, but that is purely a coincidence.

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

## Contributing

- Clone the repository locally and open in VS Code
- Run "Extensions: Show Recommended Extensions" from the [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) and install all extensions listed under "Workspace Recommendations"
- Run `npm install`
- Run `npm run build`
- Run `npm link`
- Create or open a local function app to test with
- In the local function app:
  - Run `npm link @azure/functions`. This will point your app to the local repository for the `@azure/functions` package
  - Add the following settings to your "local.settings.json" file or configure them directly as environment variables
    - `languageWorkers__node__arguments`: `--inspect`
      > 💡 Tip: Set `logging__logLevel__Worker` to `debug` if you want to view worker-specific logs in the output of `func start`
  - Start the app (i.e. run `func start` or press <kbd>F5</kbd>)
- Back in the framework repository, press <kbd>F5</kbd> and select the process for your running function app
- Before you submit a PR, run `npm test` and fix any issues. If you want to debug the tests, switch your [launch profile](https://code.visualstudio.com/docs/editor/debugging) in VS Code to "Launch Unit Tests" and press <kbd>F5</kbd>.

### Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

### Contributing to type definitions

The type definitions are located in the `types` folder. Please make sure to update the tests in `./test/types/index.test.ts` as well.
