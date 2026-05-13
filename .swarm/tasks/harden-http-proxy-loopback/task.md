# Bind proxy to loopback

- Task ID: `harden-http-proxy-loopback`
- Round: 1
- Branch: worker/task-1
- Dependencies: (none)

## Description

Update `src/http/httpProxy.ts` to harden the streaming proxy without changing public APIs. Add a local helper that selects a usable concrete loopback bind address and serializes the exact `HttpUri` (including IPv6 bracket handling if needed), use that address for the initial `server.listen` and the `findOpenPort` rebind flow, and preserve PR #315 port-0 fallback behavior. Reject malformed proxy requests immediately when `x-ms-invocation-id` is missing or invalid, but keep the existing host-facing correlation contract and do not introduce repo-only auth headers/tokens or public type changes.