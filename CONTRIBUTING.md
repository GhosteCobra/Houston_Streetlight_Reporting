# Contributing

Coding agents must first read [AGENTS.md](AGENTS.md) and the relevant bundled skills. Use a separate task worktree and record file scope, dependencies, and evidence. See the [startup guide](docs/agent-workflow.md).

Start with the [team docs](docs/README.md), your [role guide](docs/roles/README.md), and an issue from the [backlog](docs/backlog.md). This is a documentation scaffold; application checks become mandatory when implemented.

## Work cycle

1. Create/claim an issue with scope, acceptance criteria, dependencies, and owner.
2. Start from current develop and use a short-lived feature/, fix/, docs/, test/, or ci/ branch. If develop is absent, the maintainer must first create it from main as described in the README.
3. Coordinate shared contract, package/lockfile, root config, and migration changes before editing. Use separate worktrees for concurrent agents.
4. Implement the scoped task and record manual or automated checks. Avoid unrelated rewrites.
5. Fetch and merge origin/develop into the work branch; resolve conflicts with affected owners and rerun relevant checks.
6. Open a PR into develop using the template. Another teammate reviews; the author cannot self-approve.
7. Integrate and test the complete flow on develop. Release through a reviewed develop → main PR.

Use descriptive commits such as `feat: add manual pole selection` or `docs: clarify upload contract`. Stage intended files only. Never commit private photos, credentials, .env secrets, or unapproved provider datasets.

## Shared contracts

The [data](docs/data-contract.md) and [API](docs/api-contract.md) documents are the proposed source of truth. Coordinate changes with dependent roles, then update types, mocks, migrations, tests, and documentation together. Record major decisions in docs/decisions.md.

## Definition of done

Acceptance criteria met; error/fallback paths checked; no secrets; another teammate can reproduce; affected documentation updated; review completed; configured CI checks pass. For documentation-only changes, run `python3 scripts/check_framework.py` and `git diff --check`. Do not claim runtime tests. Follow AGENTS.md for explicit main-delivery requests and optional reviewer availability.

See [.github/OWNERSHIP.md](.github/OWNERSHIP.md) for reviewer routing. This scaffold does not configure branch protection or create issues, accounts, or CI runs.
