# Person 1 — Product and provider research

**Assignment:** TBD. **Status:** planned.

## Scope

Primary paths: `docs/requirements.md`, `docs/provider-research.md`, `docs/backlog.md`, `docs/decisions.md`, `docs/demo.md`. Consult [ownership](../../.github/OWNERSHIP.md) for shared files.

## First work items

1. Assign owners and confirm the MVP, demo audience, and recommended stack.
2. Turn backlog tasks into issues with inputs, outputs, dependencies, and acceptance criteria.
3. Verify provider data access and record evidence, terms, field mapping, and outstanding questions.
4. Coordinate interface decisions and release review; keep scope focused on photo → location → review → save.
5. Prepare the demo script and distinguish internal confirmation from utility receipt.

## Dependencies and handoff

Persons 2 and 4 need a documented data-access decision. Person 3 needs approved flow/copy. Person 5 needs acceptance scenarios and a release checklist.

Use the [data contract](../data-contract.md), [API contract](../api-contract.md), and [architecture](../architecture.md). Include changed interfaces, test evidence, and remaining limitations in your PR.

## Acceptance checklist

- [ ] All five roles have a named owner and review partner.
- [ ] MVP and later work are separated, and unanswered provider questions are visible.
- [ ] Each planned feature has acceptance criteria and a dependency owner.
- [ ] Demo wording makes no unsupported utility-delivery or repair promise.

## Suggested first branch

`docs/project-requirements` from `develop`, then PR back to `develop`. Coordinate scaffold/shared-file changes before starting. See [contributing](../../CONTRIBUTING.md).
