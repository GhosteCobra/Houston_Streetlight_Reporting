# ArcGIS map and pole picker

**Owner:** Person 2. **Status:** demo report map plus fixed-area CenterPoint preview.

## Purpose

Display normalized poles, map condition legend, candidate details, and manual correction.

## Planned contents

`StreetlightMap.tsx` renders normalized coordinates in a browser-only ArcGIS view. The report flow supplies demo poles. `/centerpoint-preview` supplies a small live CenterPoint result and enables facility ID labels.

## Working rules

Input: poles/selection/location. Output: selected pole/corrected coordinates. Load in browser only, retain attribution, and handle empty/failed services.

Use the [team guides](../../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
