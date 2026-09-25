# Person 2 — ArcGIS map and pole data

**Assignment:** TBD. **Status:** planned.

## Agent startup

Read [AGENTS.md](../../AGENTS.md), load the applicable bundled skills, and follow the [startup/handoff guide](../agent-workflow.md). Claim your task, file scope, branch/worktree, dependencies, and reviewer before editing.

## Scope

Primary paths: `src/components/map/`, `src/lib/arcgis/`, `data/`. Consult [ownership](../../.github/OWNERSHIP.md) for shared files.

## First work items

1. Create synthetic poles with stable DEMO-prefixed IDs, including nearby and no-match scenarios.
2. Implement a browser-only ArcGIS map, accessible pole list, marker selection, and condition legend.
3. Normalize permitted source geometry to WGS84 and preserve source/provenance information.
4. Expose selected pole and corrected location through the shared component contract.
5. Handle loading, empty results, service failure, ambiguous matches, bounded queries, and attribution.

## Dependencies and handoff

Person 4 owns server-side proximity decisions; agree on coordinates, distance units, and pole IDs first. Person 3 owns the draft form and consumes your selection events.

Use the [data contract](../data-contract.md), [API contract](../api-contract.md), and [architecture](../architecture.md). Include changed interfaces, test evidence, and remaining limitations in your PR.

## Acceptance checklist

- [ ] Selecting a marker or list item produces the same pole selection.
- [ ] Manual correction works without a successful GPS request.
- [ ] Unknown map condition is not displayed as a confirmed working light.
- [ ] No private or unlicensed utility dataset is committed; source errors leave a usable form.

## Suggested first branch

`feature/streetlight-map` from `develop`, then PR back to `develop`. Coordinate scaffold/shared-file changes before starting. See [contributing](../../CONTRIBUTING.md).
