# ArcGIS map and pole picker

**Owner:** Person 2. **Status:** demo report map plus browsable CenterPoint preview.

## Purpose

Display normalized poles, map condition legend, candidate details, and manual correction.

## Planned contents

`StreetlightMap.tsx` renders normalized demo coordinates in a browser-only ArcGIS view. `centerpoint/CenterPointMap.tsx` renders the official CenterPoint map-image layer and emits taps for bounded record lookup.

## Working rules

Input: poles/selection/location. Output: selected pole/corrected coordinates. Load in browser only, retain attribution, and handle empty/failed services.

Use the [team guides](../../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
