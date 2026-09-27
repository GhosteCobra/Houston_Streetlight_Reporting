# ArcGIS data adapter

**Owner:** Person 2 with Person 4. **Status:** live provider adapter and synthetic test fixtures.

## Purpose

Normalize synthetic or approved ArcGIS data into the pole contract.

## Planned contents

`poles.ts` contains the bounded same-origin CenterPoint client, ranker and display-label helper. The demo adapter remains for isolated tests; live failures never substitute synthetic records.

`map-layers.ts` defines public display-service URLs, the mode choices, and the street-level scale threshold. It does not change pole matching or reporting contracts.

## Working rules

Record source spatial reference and physical asset ID mapping. Bound queries and preserve attribution; no guessed private service URLs.

Use the [team guides](../../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
