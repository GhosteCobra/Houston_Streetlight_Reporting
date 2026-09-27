# Default, satellite and 3D maps

Branch: `codex/3d-map-layers-0927`. Base: `df26fb0` (current main integrated into a branch created from develop). No main merge.

## Behavior

The main map keeps its Default mode and adds Satellite and 3D controls at the top right. Satellite uses Esri imagery with labels. The 3D control shows a pending message, retaining the current map. The user rejected untextured building models and explicitly deferred Google billing setup. No box-building layer remains. Imagery is dated source imagery, not a live camera feed.

At scales wider than 1:10,000, the map shows CenterPoint's official service-area polygon with a dark outline and a light fill. This follows the requested outlined overview instead of covering Houston in pink. The Service area button fits the published polygon extent; clicking the overview zooms to street level. At street level the official streetlight layer supplies pink symbols and FACILITYID labels. Coverage does not mean every pole exists in the database, and does not indicate outage/restoration status.

The provider renders bounded map images. The browser does not download the full pole dataset. Pole selection still uses the existing bounded nearby lookup and explicit confirmation. Neither imagery nor 3D buildings improves the accuracy of CenterPoint's original pole coordinates. No submission API, credentials, schema, photo handling or report state changes were introduced.

Default and Satellite share one view and preserve map position when switching.

## Pending photorealistic 3D

Google Photorealistic 3D Tiles is the proposed source. It requires a Google Cloud project with billing, Map Tiles API enabled, and a browser-restricted API key. The user chose to keep this pending on September 27, 2026. No Google service is called, key is committed, or billing is configured by this branch.

After setup, add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to ignored `.env.local` and Vercel preview environment variables. Restrict it to the Map Tiles API and the exact local/preview/production HTTP referrers; configure quota limits. Rebuild for Next.js public variables. Do not paste keys into chat or Git.

The existing ArcGIS SDK supports `IntegratedMesh3DTilesLayer` with Google tiles using `customParameters: { key }`. Its attribution widget includes Google Maps and dynamic tile credits. Implement this in the isolated 3D view, retain the CenterPoint overlay, and verify actual Houston imagery, pole draping, attribution visibility, camera continuity and physical-device performance before shipping. This integration is not implemented or validated in this branch. Do not use Google imagery for automated pole extraction; it would be a visual confirmation background only.

## Sources

- [CenterPoint public service](https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer): layer 0 Streetlights, layer 1 CNP Service Area.
- [Google Photorealistic 3D Tiles setup](https://developers.google.com/maps/documentation/tile/3d-tiles) and [display policies](https://developers.google.com/maps/documentation/tile/policies).
- [MapImageLayer](https://developers.arcgis.com/javascript/latest/references/core/layers/MapImageLayer/) and [SceneLayer](https://developers.arcgis.com/javascript/latest/references/core/layers/SceneLayer/).

The Service area button bounds come from layer 1's `returnExtentOnly=true&outSR=4326` query on September 27, 2026. This query returns four bounds, not features. All provider attribution remains visible.

## Verification

September 27, 2026, local Next.js app on port 3137, Codex in-app browser. Tested 677px desktop-panel width and a 390 × 844 phone viewport. Real screenshots are retained locally under ignored `.artifacts/map-layers/`.

Verified Default → Satellite, live pink pole labels over imagery, outlined service-area overview and click-to-zoom from coverage to individual poles. The earlier 3D geometry proof was removed after user feedback; its screenshots are historical, not evidence of the final UI. The final 3D state is pending. Existing unit tests: 20 passed. Production build and framework checks pass. Hardware camera/GPS and physical iOS/Android devices were not tested. No real reports were submitted. Greptile not run; no configured reviewer is verified.

Skills applied: new-feature, code-structure, evidence-driven-testing, before-and-after and unslop. Person 2 map/data owns this scope; Person 3 and Person 5 should review map layout and mobile rendering. Existing report contracts remain unchanged.
