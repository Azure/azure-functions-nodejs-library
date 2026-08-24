# Stable npm release pipeline

`release.yml` publishes the `nodejs-library.official` build's unchanged `drop`
artifact. It defaults to `NpmPublishDryRun: true`. A dry run validates the
repository-specific npm tag/version rules and runs:

```text
npm publish <package.tgz> --tag <tag> --registry https://registry.npmjs.org --@azure:registry=https://registry.npmjs.org --dry-run --ignore-scripts
```

Set `NpmPublishDryRun: false` only after verifying the package version and npm
tag. Real publishing delegates the unchanged `drop` artifact to the shared
engineering `release-npm-package.yml` template with `publishMethod: esrp`. The
dry-run path does not publish.

## Azure DevOps configuration

Create the `azure-functions-nodejs-library-release` variable group with:

| Variable | Purpose |
| --- | --- |
| `EsrpOwners` | Individual Microsoft aliases that own the ESRP release, separated by commas or newlines. Distribution lists and security groups are not supported. |
| `EsrpApprovers` | Individual Microsoft aliases that approve the ESRP release, separated by commas or newlines. These must differ from the owners. |
| `EsrpManualApprovers` | Azure DevOps users or groups allowed to approve the manual validation before publishing. |

Authorize `release.yml` to use the variable group, the internal `engineering`
repository, the ESRP service connection, and the `nodejs-library.official`
pipeline resource. Add `microsoft1es` and `microsoft-oss-releases` as read/write
collaborators for the `@azure/functions` npm package.
