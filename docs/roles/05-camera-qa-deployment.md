# Person 5 — Camera, quality, and deployment

**Assignment:** TBD. **Status:** planned.

## Agent startup

Read [AGENTS.md](../../AGENTS.md), load the applicable bundled skills, and follow the [startup/handoff guide](../agent-workflow.md). Claim your task, file scope, branch/worktree, dependencies, and reviewer before editing.

## Scope

Primary paths: `src/components/camera/`, `tests/`, `.github/workflows/`, `docs/setup.md`, `docs/deployment.md`. Consult [ownership](../../.github/OWNERSHIP.md) for shared files.

## First work items

1. Implement capture/upload input, preview, retake/remove, and no-photo fallback.
2. Agree on supported formats and validation with Person 4; handle orientation, compression, and metadata.
3. Coordinate real-device tests on iOS Safari and Android Chrome and record results.
4. Add formatting, type checks, unit/integration/browser tests, and CI after application bootstrap.
5. Configure an HTTPS preview using sample data and document setup, release, rollback, and known limitations.

## Dependencies and handoff

Person 3 owns the report draft. Person 4 owns authorization and upload persistence; never independently weaken storage policies to make a demo work. All owners supply feature tests.

Use the [data contract](../data-contract.md), [API contract](../api-contract.md), and [architecture](../architecture.md). Include changed interfaces, test evidence, and remaining limitations in your PR.

## Acceptance checklist

- [ ] Camera denial, unsupported format, large image, and slow upload have recovery paths.
- [ ] Temporary preview URLs and any camera streams are cleaned up.
- [ ] Private image access is verified with two different test sessions.
- [ ] Clean checkout setup and the main flow work on a second teammate’s device.
- [ ] CI and deployment are described as active only after verified runs.

## Suggested first branch

`feature/photo-upload` from `develop`, then PR back to `develop`. Coordinate scaffold/shared-file changes before starting. See [contributing](../../CONTRIBUTING.md).
