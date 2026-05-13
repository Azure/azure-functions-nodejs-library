# Guard capability compatibility

- Task ID: `add-http-stream-capability-tests`
- Round: 1
- Branch: worker/task-3
- Dependencies: harden-http-proxy-loopback

## Description

Add worker-host compatibility coverage centered on `ProgrammingModel.getCapabilities` (new `test/ProgrammingModel.test.ts` and any targeted updates to `test/InvocationModel.test.ts` or related tests as needed). Verify `enableHttpStream` locks setup, custom capabilities still merge, and the hardened proxy surfaces an absolute internal `HttpUri` that matches current host expectations without changing customer-facing setup/types. Add at least one streamed-invocation regression test to prove host-style forwarded headers/route params still build a usable `HttpRequest` and that enabling proxying keeps the existing gRPC contract intact. Make only minimal runtime adjustments if the loopback URI handling exposes an integration issue, then run the relevant targeted tests plus `npm test`.