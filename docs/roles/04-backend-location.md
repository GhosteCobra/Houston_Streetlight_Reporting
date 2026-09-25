# Person 4 — API, location, and persistence

**Assignment:** TBD. **Status:** planned.

## Scope

Primary paths: `src/app/api/`, `src/lib/server/`, `src/lib/schemas/`, `supabase/`. Consult [ownership](../../.github/OWNERSHIP.md) for shared files.

## First work items

1. Implement shared Zod contracts and publish typed request/response shapes.
2. Create migrations for poles, reports, and report status events, with ownership and access policies.
3. Implement nearby-pole lookup, optional geocoding, bounded duplicate checks, and manual-location support.
4. Authorize photo upload references and report access; validate ownership before saving.
5. Implement idempotent report creation, server-generated IDs/timestamps, and a demo-only provider adapter.

## Dependencies and handoff

Person 2 supplies normalized pole data. Person 3 needs stable errors and response shapes. Person 5 needs upload authorization, bucket rules, and staging fixtures.

Use the [data contract](../data-contract.md), [API contract](../api-contract.md), and [architecture](../architecture.md). Include changed interfaces, test evidence, and remaining limitations in your PR.

## Acceptance checklist

- [ ] Invalid coordinates and unowned photo paths are rejected.
- [ ] Different sessions cannot retrieve one another’s reports or images.
- [ ] Repeated submission with the same key and payload returns the original report.
- [ ] Client input cannot choose owner, creation time, or repaired status.
- [ ] Demo submissions do not contact a utility.

## Suggested first branch

`feature/report-api` from `develop`, then PR back to `develop`. Coordinate scaffold/shared-file changes before starting. See [contributing](../../CONTRIBUTING.md).
