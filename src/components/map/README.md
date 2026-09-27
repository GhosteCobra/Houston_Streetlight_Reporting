# ArcGIS map and pole picker

**Owner:** Person 2. **Status:** CenterPoint streetlight overlay and bounded selection.

## Purpose

Display normalized poles, map condition legend, candidate details, and manual correction.

## Planned contents

`StreetlightMap.tsx` overlays the official CenterPoint map-image layer on OpenStreetMap, with only the confirmed selection highlighted. Its top-corner controls switch between Default and satellite imagery. The 3D control opens satellite terrain with untextured building models. Photorealistic Google imagery remains deferred. Wide views show the official service-area outline; individual poles and FACILITYID labels appear at street level. Provider geometry stays unchanged. `centerpoint/CenterPointMap.tsx` renders the official CenterPoint map-image layer and emits taps for bounded record lookup.

## Working rules

Input: poles/selection/location. Output: selected pole/corrected coordinates. Load in browser only, retain attribution, and handle empty/failed services.

Use the [team guides](../../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
