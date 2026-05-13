## Context
- No prior round-1 design document was present at `.swarm/run/rounds/round-1/planning/design-document.md`, so this revision is based on the current repo state.
- `src/http/httpProxy.ts` is the local HTTP streaming bridge enabled by `app.setup({ enableHttpStream: true })`. It was introduced with HTTP streaming in PR #212 and later updated in PR #315 for port-0 / VNET reliability.

## Assessment
- **Relevance / actionability:** The finding is only partly a public-surface issue. In the Azure Functions host, customer authentication/authorization happens before the request is forwarded to the worker, and the host currently injects only `x-ms-invocation-id` for proxy correlation (`FunctionInvocationMiddleware` / `DefaultHttpProxyService` in the host repo). However, the worker proxy still binds wildcard interfaces today, so any process that can reach that port inside the same machine or network namespace could bypass the host-facing checks. That makes the finding actionable as local-channel hardening.
- **Are fixes necessary?** Yes for repo-local hardening: bind the proxy to loopback only and fail fast on malformed proxy traffic. Adding a new application-layer auth token is **not** a safe repo-only change because the current host/worker contract does not send one; doing so would require coordinated host changes and risks breaking existing host/library combinations.
- **Historical context:** The code path was optimized for feature enablement and platform compatibility, not for a separately authenticated proxy channel. The lack of explicit loopback binding looks like a missed hardening gap rather than a documented intentional security posture.
- **Regression / breaking-change risk:** Low if the worker binds and advertises the same concrete loopback address family, while preserving the existing port-0 fallback logic. This should not be a customer contract break because `HttpUri` is an internal worker capability, not a documented customer API. The main compatibility risk is only host forwarding to the updated loopback URI literal.
- **Current test posture:** The repo has 28 unit-test files around setup, invocation, request/response, and converters, but there is no direct coverage for `httpProxy.ts` or `ProgrammingModel.getCapabilities`. The planner workspace has no installed dev dependencies, so runtime behavior was assessed statically rather than by executing `npm test`.

## Implementation direction
1. Keep the fix scoped to this repo: harden the proxy listener rather than inventing a new cross-repo auth contract.
2. In `src/http/httpProxy.ts`, bind both the HTTP proxy server and the port-probe socket to an explicit loopback address, and return the exact bound loopback URI instead of a generic `localhost` URI.
3. Preserve the existing `x-ms-invocation-id` correlation model and PR #315 port-0 retry behavior.
4. Reject malformed proxy requests (for example, missing correlation header) with a fast failure instead of only logging and leaving the connection open.
5. Add direct proxy tests that cover listener setup, request/response correlation, malformed-request handling, and the port-0 fallback path, then run the full unit suite after installing dev dependencies.

## Non-goal
- Do **not** add a new required auth header/token in this repo alone; if security requires app-layer authentication on the internal proxy, that should be tracked as a coordinated follow-up with the Azure Functions host.