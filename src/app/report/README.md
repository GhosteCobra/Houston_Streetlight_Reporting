# Report journey

**Owner:** Person 3. **Status:** documentation placeholder; implementation pending.

## Purpose

Own the shared draft and capture → location → issue → review → submit → confirmation flow.

## Planned contents

Future page/controller, review and confirmation views, draft state and error presentation.

## Working rules

Consume map/camera events and shared schemas. Never show confirmation until the report API confirms persistence.

Use the [team guides](../../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.

## Person 3 implementation

Implemented: page.tsx starts ReportJourney with an optional selected synthetic pole. ReportJourney owns the in-memory draft and waits for the local demo adapter to persist before displaying confirmation. Production API integration remains pending.

