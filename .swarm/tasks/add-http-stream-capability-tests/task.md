# Guard capability compatibility

- Task ID: `add-http-stream-capability-tests`
- Round: 1
- Branch: worker/task-3
- Dependencies: harden-http-proxy-loopback

## Description

Add `test/ProgrammingModel.test.ts` (or equivalent) to cover `ProgrammingModel.getCapabilities` when HTTP streaming is enabled. Verify setup locking still works, custom capabilities still merge, and the proxy `HttpUri` is surfaced as an internal worker capability without changing customer-facing setup/types. Make any minimal `src/ProgrammingModel.ts` adjustments only if the new loopback URI handling exposes an integration issue, then run `npm test`.