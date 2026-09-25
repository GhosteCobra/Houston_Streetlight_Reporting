# Shared validation schemas

**Owner:** Person 4; review with consumers. **Status:** documentation placeholder; implementation pending.

## Purpose

Canonical Zod schemas and inferred types for poles, report creation, uploads, and errors.

## Planned contents

Future pole.ts, report.ts, upload.ts and response types.

## Working rules

Follow docs/data-contract.md and docs/api-contract.md. Reject server-owned input fields; test range, nullability, and enum boundaries.

Use the [team guides](../../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
