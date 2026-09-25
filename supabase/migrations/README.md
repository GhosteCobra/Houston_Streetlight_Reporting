# Schema migrations

**Owner:** Person 4. **Status:** documentation placeholder; implementation pending.

## Purpose

Versioned SQL changes for tables, constraints, indexes, and access policies.

## Planned contents

Future timestamped SQL migrations; no migration is supplied yet.

## Working rules

Enforce unique session/idempotency keys, report ownership, valid enum/range values, and status event references. Describe rollout/backfill/recovery and test from an empty sample database.

Use the [team guides](../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
