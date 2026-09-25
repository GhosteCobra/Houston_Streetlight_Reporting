# Shared logic and integrations

**Owner:** Person 4 coordinates; Person 2 owns arcgis/. **Status:** documentation placeholder; implementation pending.

## Purpose

Separate schemas, browser-safe ArcGIS adapters, and server-only business logic.

## Planned contents

schemas/, arcgis/, server/.

## Working rules

Do not re-export server secrets through a shared browser import. Document interface changes before consumers depend on them.

Use the [team guides](../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
