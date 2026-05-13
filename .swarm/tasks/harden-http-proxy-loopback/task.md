# Bind proxy to loopback

- Task ID: `harden-http-proxy-loopback`
- Round: 1
- Branch: worker/task-1
- Dependencies: (none)

## Description

Update `src/http/httpProxy.ts` to harden the streaming proxy. Add a helper that selects and serializes a concrete loopback binding (including IPv6 bracket handling), use that host for both the HTTP server and the `findOpenPort` probe, and return the exact bound `HttpUri`. Preserve the current `x-ms-invocation-id` correlation contract and PR #315 port-0 fallback behavior. When a request is missing or has an invalid correlation header, respond/close immediately instead of only logging. Do not add new host/library auth headers or public API/type changes.