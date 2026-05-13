# Cover proxy hardening paths

- Task ID: `add-http-proxy-tests`
- Round: 1
- Branch: worker/task-2
- Dependencies: harden-http-proxy-loopback

## Description

Create `test/http/httpProxy.test.ts` with direct coverage for `setupHttpProxy`, `waitForProxyRequest`, and `sendProxyResponse` using real HTTP round-trips plus targeted stubs/spies where determinism is needed. Cover successful request/response correlation, status/header/cookie/body propagation, immediate rejection of malformed requests missing or invalid `x-ms-invocation-id`, loopback-only `HttpUri` formatting/reachability, and the port-0/open-port fallback path on the same loopback family. Run `npm ci` if dependencies are absent, then run the targeted proxy tests.