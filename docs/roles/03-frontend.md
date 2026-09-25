# Person 3 — Web experience and report form

**Assignment:** TBD. **Status:** planned.

## Agent startup

Read [AGENTS.md](../../AGENTS.md), load the applicable bundled skills, and follow the [startup/handoff guide](../agent-workflow.md). Claim your task, file scope, branch/worktree, dependencies, and reviewer before editing.

## Scope

Primary paths: `src/app/ (excluding api/)`, `src/app/report/`, `src/components/report/`. Consult [ownership](../../.github/OWNERSHIP.md) for shared files.

## First work items

1. Scaffold the Next.js/TypeScript application with Person 5 and define the responsive page shell.
2. Build home/capture entry, draft form, location review, issue selection, and report review.
3. Integrate map and camera through their documented interfaces rather than duplicating their state.
4. Add duplicate warnings, field errors, pending submission, retry, and confirmation states.
5. Implement accessible labels, keyboard flow, text status, and a usable non-map location option.

## Dependencies and handoff

Person 2 provides map selection; Person 5 provides photo capture; Person 4 provides schemas and API responses. Use contract-matching mocks while these are in progress.

Use the [data contract](../data-contract.md), [API contract](../api-contract.md), and [architecture](../architecture.md). Include changed interfaces, test evidence, and remaining limitations in your PR.

## Acceptance checklist

- [ ] No account-creation form is required for the planned anonymous reporting session.
- [ ] A photo can be replaced or omitted after capture failure.
- [ ] Failed saves preserve draft fields; success is shown only after confirmed persistence.
- [ ] Confirmation identifies a demo/internal report and does not imply provider submission.

## Suggested first branch

`feature/report-form` from `develop`, then PR back to `develop`. Coordinate scaffold/shared-file changes before starting. See [contributing](../../CONTRIBUTING.md).
