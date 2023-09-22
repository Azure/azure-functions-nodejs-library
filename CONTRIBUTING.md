# Contributing

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

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Contributing to type definitions

The type definitions are located in the `types` folder. Please make sure to update the tests in `./test/types/index.test.ts` as well.
