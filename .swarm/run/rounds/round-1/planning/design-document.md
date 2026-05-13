## Context
- Existing round-1 design still stands: `src/http/httpProxy.ts` is the internal HTTP streaming bridge behind `app.setup({ enableHttpStream: true })`.
- Upstream history still suggests feature-first evolution: PR #212 introduced streaming with a “minimal user changes” goal, and PR #315 later added port-0/VNET reliability handling. There is no evidence that wildcard binding was an intentional security posture.

## Assessment
- **Finding relevance:** Actionable. The host remains the external auth boundary, but this library currently binds the worker proxy on all interfaces while trusting only `x-ms-invocation-id` for correlation.
- **Will the repo-only change fully resolve the gap?** It resolves the repo-local “all interfaces / unauthenticated listener” exposure by constraining reachability to loopback and rejecting malformed proxy traffic. It does **not** create a fully authenticated channel: a same-host or same-network-namespace process that can reach loopback and learn/guess an invocation ID could still spoof proxy traffic. Closing that residual exposure requires a coordinated host+library contract change.
- **Are fixes necessary?** Yes. Loopback-only binding and fast failure on malformed proxy requests are necessary hardening and align the listener with the `localhost` URI the library already advertises today.
- **Regression / breaking-change risk:** Low if the worker binds and returns the exact bound loopback URI (including IPv6-safe formatting) and preserves PR #315 port-fallback behavior. `HttpUri` is an internal worker capability parsed by the host as a URI string, so this is not a customer API contract break. The main risk is address-family mismatch or retry regressions, which should be covered by tests.
- **Current test posture:** After `npm ci`, `npm test` passes in the planner workspace (`357 passing`), but there is still no direct coverage for `src/http/httpProxy.ts` or `ProgrammingModel.getCapabilities`.

## Implementation direction
1. In `src/http/httpProxy.ts`, choose a concrete loopback binding once, use it for both the HTTP listener and the open-port probe, and return the exact bound URI instead of a generic `localhost` string.
2. Preserve the existing `x-ms-invocation-id` correlation contract; do not add a repo-only auth token/header that the host does not send today.
3. Fast-fail malformed proxy requests (missing/invalid correlation header) with an immediate error response/connection close instead of only logging.
4. Add focused unit coverage for proxy binding, correlation, malformed requests, port-0 fallback, and `ProgrammingModel.getCapabilities` integration.

## Non-goal / follow-up
- Do **not** claim this repo-only change creates a fully authenticated host/worker channel. If the SFI owner needs protection against untrusted same-host peers, track a coordinated follow-up in `azure-functions-host` plus this library.