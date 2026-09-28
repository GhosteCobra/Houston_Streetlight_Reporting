# HTTP routes

**Owner:** Person 4. **Status:** read-only CenterPoint inspection implemented.

## Purpose

Implement the documented pole, location, upload, and report endpoints.

## Planned contents

`address-search/route.ts` provides explicit, uncached Census address searches with input validation, an instance request budget and recoverable errors.

`centerpoint/nearby/route.ts` validates Houston-region coordinates, queries a fixed 25 m radius, and applies an instance request budget.

## Working rules

Authenticate and validate every write, authorize record access, and keep secrets server-only. Write APIs remain unimplemented.

Use the [team guides](../../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
