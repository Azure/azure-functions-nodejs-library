# Add proxy hardening tests

- Task ID: `add-http-proxy-hardening-tests`
- Round: 1
- Branch: worker/task-2
- Dependencies: (none)

## Description

Create direct coverage for `setupHttpProxy`, `waitForProxyRequest`, and `sendProxyResponse` (for example in `test/http/httpProxy.test.ts`) using a mix of real HTTP round-trips and stubs/spies where needed. Assert that the advertised URI is loopback-only, correlated requests still flow end-to-end, malformed requests missing `x-ms-invocation-id` are rejected promptly, and the port-0/open-port retry path still rebinds on loopback with a usable nonzero port. Install dev dependencies if needed and run targeted proxy tests plus the full `npm test` suite before handing off.