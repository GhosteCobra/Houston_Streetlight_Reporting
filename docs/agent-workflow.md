# Start a coding-agent task

Every teammate should direct their coding agent to [AGENTS.md](../AGENTS.md) before work. Use the exact uppercase filename. Some tools discover it automatically; others require an explicit prompt. This applies to the team's Astro agent as well as other coding tools and does not change the selected Next.js web framework.

## Startup prompt

```text
Read AGENTS.md first, then the relevant role guide, folder READMEs,
and applicable .agents/skills/*/SKILL.md files under the project overrides.
Work on this issue: <issue and acceptance criteria>.
Role/owner: <person>.
Scope: <files/modules>.
Base: origin/develop, unless this task explicitly names another base.
Use your own isolated worktree and task branch. Check current changes
and open PR file overlap before editing. Keep shared contracts in sync.
Record actual verification and untested cases. Open a PR to develop;
do not merge or push main unless this task explicitly authorizes it.
```

## Task claim and handoff

Record the issue, owner, branch/worktree, base revision, file scope, dependencies, reviewer, and loaded skills in the task or PR. Another person should be able to tell which files are being edited without reading the agent transcript.

Each task finishes with changed behavior/files, shared-contract changes, exact checks/evidence, known limits, and the next owner's action. Do not reuse another agent's worktree or stop its server. Confirm ports and use separate test data when working at the same time.

## Tool availability

The bundled files are guidance, not proof that slash commands, Greptile, recording tools, or npm scripts exist. Use the available host tooling and report gaps honestly. See [source adaptations](../.agents/README.md). The current documentation check is `python3 scripts/check_framework.py`; application runtime tests remain pending bootstrap.
