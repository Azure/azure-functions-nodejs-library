# Cover proxy hardening paths

- Task ID: `add-http-proxy-tests`
- Round: 1
- Branch: worker/task-2
- Dependencies: harden-http-proxy-loopback

## Description

Create `test/http/httpProxy.test.ts` with direct coverage for `setupHttpProxy`, `waitForProxyRequest`, and `sendProxyResponse`. Cover successful request/response correlation, status/header/cookie propagation, malformed-request rejection and cleanup, loopback URI formatting, and the port-0/open-port fallback path (stub `http`/`net` where determinism is needed). Verify the new proxy-focused tests pass.