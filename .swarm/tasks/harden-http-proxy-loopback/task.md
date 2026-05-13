# Bind proxy to loopback

- Task ID: `harden-http-proxy-loopback`
- Round: 1
- Branch: worker/task-1
- Dependencies: (none)

## Description

Update `src/http/httpProxy.ts` so the streaming proxy binds only to a concrete loopback address (prefer a numeric loopback literal and return the exact bound URI), and use that same loopback bind for the `findOpenPort` fallback path. Preserve the current `x-ms-invocation-id` correlation flow and the PR #315 port-0 logic, but fail fast on malformed proxy requests instead of only logging them. Add a short inline comment explaining that repo-only hardening must stay compatible with the current host contract and therefore should not introduce a new required auth token/header here.