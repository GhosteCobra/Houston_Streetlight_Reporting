# Application routes

**Owner:** Person 3; Person 4 owns api/. **Status:** demo report journey and read-only GIS preview.

## Purpose

Home page, root layout, reporting journey, and HTTP Route Handlers.

## Planned contents

`page.tsx` opens the demo report journey. `centerpoint-preview/page.tsx` server-renders a fixed downtown test area through the CenterPoint adapter and reuses the map without changing report submission.

## Working rules

Camera and ArcGIS usage belongs behind client boundaries. Coordinate layout/global-style changes with other owners.

Use the [team guides](../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
