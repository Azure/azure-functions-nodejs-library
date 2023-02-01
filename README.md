# Azure Functions Node.js Framework

|Branch|Status|Support level|Node.js Versions|
|---|---|---|---|
|v4.x|[![Build Status](https://img.shields.io/azure-devops/build/azfunc/Azure%2520Functions/145/v4.x)](https://azfunc.visualstudio.com/Azure%20Functions/_build/latest?definitionId=145&branchName=v4.x) [![Test Status](https://img.shields.io/azure-devops/tests/azfunc/Azure%2520Functions/146/v4.x?compact_message)](https://azfunc.visualstudio.com/Azure%20Functions/_build/latest?definitionId=146&branchName=v4.x)|Preview|18|
|v3.x (default)|[![Build Status](https://img.shields.io/azure-devops/build/azfunc/Azure%2520Functions/145/v3.x)](https://azfunc.visualstudio.com/Azure%20Functions/_build/latest?definitionId=145&branchName=v3.x) [![Test Status](https://img.shields.io/azure-devops/tests/azfunc/Azure%2520Functions/146/v3.x?compact_message)](https://azfunc.visualstudio.com/Azure%20Functions/_build/latest?definitionId=146&branchName=v3.x)|GA (Recommended)|18, 16, 14|

## Install

```
npm install @azure/functions
```

## Usage

_**UPDATE**_: **See here for important information on v4 of the Azure Functions Node.js Framework: https://aka.ms/AzFuncNodeV4**

Prior to version 3.5.0, this package only contained TypeScript type definitions. Starting with version 3.5.0 it _also_ contains the underlying Azure Functions Framework for Node.js. This framework package is included by default in [v4.x of the Azure Functions runtime](https://docs.microsoft.com/azure/azure-functions/functions-versions?pivots=programming-language-javascript), meaning you do _not_ need to include the package in your app. However, there may be cases where you want a specific version of the package, so you can override the default shipped in Azure with the below steps.

### TypeScript:

For a full tutorial, see [how to create your first TypeScript function](https://docs.microsoft.com/azure/azure-functions/create-first-function-vs-code-typescript).

1. Specify a main entrypoint in your package.json
    ```json
    "main": "dist/src/index.js"
    ```
2. Add the following code to your entrypoint file (e.g. `src/index.ts`):
    ```typescript
    import * as func from '@azure/functions';

    func.setup();
    ```

**IMPORTANT NOTE**: If you only want this package for the TypeScript type definitions, you may list this package in the "devDependencies" section of your package.json. If you are overriding the default shipped in Azure as described above, the package must be listed in the production "dependencies" section of your package.json.

For more documentation, see the [TypeScript developer guide](https://docs.microsoft.com/azure/azure-functions/functions-reference-node#typescript).

### JavaScript

For a full tutorial, see [how to create your first JavaScript function](https://docs.microsoft.com/azure/azure-functions/create-first-function-vs-code-node).

1. Specify a main entrypoint in your package.json
    ```json
    "main": "src/index.js"
    ```
2. Add the following code to your entrypoint file:
    ```javascript
    const func = require('@azure/functions');
    
    func.setup();
    ```

For more documentation, see the [JavaScript developer guide](https://docs.microsoft.com/azure/azure-functions/functions-reference-node).

## Contributing

- Clone the repository locally and open in VS Code
- Run "Extensions: Show Recommended Extensions" from the [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) and install all extensions listed under "Workspace Recommendations"
- Run `npm install`
- Run `npm run build`
- Run `npm link`
- Create or open a local function app to test with
- In the local function app:
  - Make sure you are calling `func.setup()` somewhere in your app, as described above in the "Usage" section
  - Run `npm link @azure/functions`. This will point your app to the local repository for the framework package
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