# CenterPoint integration spike

Checked 2026-09-26 on `feature/centerpoint-integration-spike`, based on `origin/develop` at `7c08aa9`. Owner: Person 2 for map/data, Person 4 for server adapter. Review partners: Persons 4 and 1. This branch adds a bounded visual preview and does not submit reports.

## Recommendation before application changes

Keep the existing synthetic `PoleDataAdapter` and report draft flow in place. The project lead reports that a CenterPoint contact gave verbal permission in a direct phone conversation for this non-commercial project to use and display its streetlight GIS data. Add a server-side, provider-neutral `GET /api/poles?latitude=…&longitude=…&radius_m=…` after the team records that conversation and confirms operational terms for caching and query volume. The route should validate the request, apply per-session/IP rate limits and a shared cache, choose a permitted provider adapter, and return a normalized pole list with source and uncertainty. The map and report form should consume that list and require a person to choose the pole. A separate report-handoff adapter must continue to say `not_sent` until CenterPoint authorizes a submission method.

The proposed boundary is:

```text
phone GPS / manual pin
  → app API: bounds, access control, rate limit, provider selection
  → CenterPointAdapter: small spatial query, WGS84 normalization, short cache
  → normalized nearby poles and distances
  → existing map/list and ranker: distance + optional typed number/direction
  → user confirms the physical pole
  → local draft / approved reporting handoff
```

`src/lib/server/centerpoint/adapter.ts` stays server-only. Following the user's request for a browsable map, `/centerpoint-preview` renders CenterPoint's MapImageLayer with its original symbols and labels. Each viewport loads a rendered image, not a copy of the regional feature dataset. Tapping the map requests at most 50 nearby records within 25 m through `/api/centerpoint/nearby`; the user explicitly chooses a pole number. The page supports GPS recentering, photo capture/upload, issue details, confirmation, report review, copying a summary, and opening the official reporting form. Photos remain in memory on the page. No utility submission API is called.

This adds one provider-specific map component and one read-only route without restructuring the existing report journey. The homepage report journey still uses demo poles. The read-only inspection endpoint validates finite Houston-region coordinates and enforces a fixed radius plus a 60-request/minute budget per server instance. Shared distributed limits remain a prerequisite for broad public rollout. Map-image requests go directly to CenterPoint and reveal the viewed extent to that service, as in its own map. ArcGIS manages viewport requests; records are queried only on explicit taps.

## Official GIS service and attributes

The [CenterPoint Houston MapServer](https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer) lists layer 0, `Streetlights`, and layer 1, `CNP Service Area`. The [Streetlights layer](https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer/0) is a queryable point layer. Its metadata advertises `Map,Query,Data`, JSON/GeoJSON/PBF responses, `maxRecordCount=2000`, pagination, and distance queries. The service's native spatial reference is WKID 103161, with latest WKID 6588, in feet. Those limits and capabilities show what the server can do; they do not grant a license to use the records.

| Field | What it appears to provide | Handling |
| --- | --- | --- |
| `OBJECTID` | ArcGIS row identifier | Keep as an opaque feature key; never label it as the printed pole number. |
| `FACILITYID` | Display field and string asset identifier | Candidate pole number, pending CenterPoint confirmation that it matches the physical label. May be null/blank in adapter output. |
| `SHAPE` | Point geometry | Request `outSR=4326`, read returned `x` as longitude and `y` as latitude. |
| `FIXTUREWATTAGE` | String wattage attribute | Optional technical detail, not proof of operation or ownership. |
| `CREATOR`, `CREATIONDATE`, `LASTUPDATE`, `UPDATEDBY` | Editing metadata | Do not request or expose for pole selection. |
| `SOURCE_GUID`, `SOURCE_OID` | Source database references | Do not treat as a public pole ID. |

The inspected layer has no address field, condition/status field, report receipt, photo metadata, or stated ownership flag for every individual point. Coverage should be checked against the service-area polygon and with CenterPoint; a nearby point does not prove responsibility for every light in Houston or Galveston.

## Bounded spatial query and WGS84

Use ArcGIS REST `MapServer/0/query` with `geometry=<longitude>,<latitude>`, `geometryType=esriGeometryPoint`, `inSR=4326`, `distance=<meters>`, `units=esriSRUnit_Meter`, `spatialRel=esriSpatialRelIntersects`, `outSR=4326`, `returnGeometry=true`, and only `OBJECTID,FACILITYID,FIXTUREWATTAGE` in `outFields`. `f=json` returns point coordinates plus the response spatial reference. The [Esri query reference](https://developers.arcgis.com/rest/services-reference/enterprise/query-map-service-layer/) documents point/distance queries and `outSR`; the metadata confirms this layer supports distance queries.

`outSR=4326` asks ArcGIS to project its native feet-based coordinates into normal WGS84. Do not interpret raw WKID 103161 coordinates as longitude/latitude, and do not swap axes: ArcGIS JSON point `x` is longitude, `y` is latitude. Check the returned spatial reference is 4326 and both numbers are finite and in range. If precise survey-grade location is needed, confirm the datum transformation and source accuracy with CenterPoint; this demo makes no such claim. GeoJSON uses the same longitude-first coordinate order.

The spike made bounded read-only queries around the fixed downtown test point `29.7604,-95.3698`. It did not enumerate object IDs, paginate, or write raw provider records to Git:

- At 150 m, asking for five records returned five points and `exceededTransferLimit=true`. That response is incomplete and must not be used for nearest-pole ranking.
- At 25 m, asking for at most 51 records returned four points, no transfer-limit flag, and `spatialReference.wkid=4326`. All four point coordinates passed WGS84 range checks. Each sampled record exposed `OBJECTID`, `FACILITYID`, and `FIXTUREWATTAGE`; no raw IDs were printed or retained.
- Calling the actual `CenterPointAdapter.nearby()` at 25 m returned four normalized poles, all within the requested radius and all with WGS84 coordinates and facility IDs. The adapter requested a 45 m buffered search, filtered to 25 m, and printed only summary booleans/count.

The adapter caps requested radius at 250 m, asks for only 51 records and rejects responses over 50 or with `exceededTransferLimit`. It deliberately does not page through a dense area. The UI should ask for a narrower area or use a manually confirmed pin if a query is incomplete. A 25 m radius is a technical proof, not a default that will always find the correct streetlight when phone GPS is inaccurate.

## Adapter and nearest-pole behavior

`CenterPointAdapter.nearby(center, radiusMeters)` returns provider-tagged points with an opaque `objectId`, nullable `facilityId`, optional wattage, WGS84 coordinates, and great-circle distance from the actual GPS point. It sorts nearest first. It validates inputs, checks HTTP and ArcGIS error responses, rejects missing/duplicate IDs and invalid geometry, and times out after five seconds. It caches successful small-area queries for one minute per rounded query center/radius and shares an in-flight request for the same key. A 20 m query buffer covers the rounding of the cache key; each caller's exact location/radius is used for final filtering. Failures get a 15-second cooldown per key, and each cache holds at most 100 keys. This in-process cache reduces repeat calls on a single instance; a production serverless deployment also needs a shared bounded cache and explicit rate limiting.

The recommended matching sequence is `GPS → bounded nearby list → distance sort → optional typed pole number and approximate device direction → explicit user choice`. A photo may help a person read a pole number or recognize the scene, but the spike includes no OCR, image classifier, or claim that photo metadata pinpoints the pole. GPS accuracy and street side should be visible. Never auto-select the closest pole; allow unknown pole and manual map correction. Existing `rankPoles` can help present candidate reasons, but must distinguish a confirmed physical label from an entered guess and must be reviewed with real data before use.

`FACILITYID` should map to a provider-specific `assetId`, not directly overwrite the app's `DEMO-` IDs. The preview tracks selection by `OBJECTID` and shows `FACILITYID` as the pole number. A missing facility ID is shown as unavailable; the GIS record ID is never substituted for a pole number. Confirm with CenterPoint whether `OBJECTID` remains stable across republishing and which identifier their form expects. If not, use an approved stable identifier. The proposed shared pole/API contract needs a coordinated revision with Persons 2, 3, and 4 before the report flow uses live poles.

## Permission and submission findings

The project lead reports verbal confirmation from a CenterPoint contact, following a long direct phone conversation, that this non-commercial project may use CenterPoint streetlight GIS data and display poles in its own app. The contact name, date and exact terms have not been recorded in this repository. This is the team's account of the permission; the public layer metadata itself does not contain a license. [CenterPoint's terms of use](https://www.centerpointenergy.com/en-us/Corp/Pages/terms-of-use.aspx) describe a personal, non-commercial license and require express prior written consent to copy, store, modify or display service content beyond those terms. The reported verbal permission supports this bounded research and the planned non-commercial display use. Before switching the report flow to live data, keep a brief written record of the call and reconcile it with the published written-consent clause. Confirm short caching, attribution, rate limits, retention and permitted origins with CenterPoint, along with coverage and physical pole-ID mapping. The report flow keeps synthetic DEMO poles; the user separately requested this visible, browsable CenterPoint preview. A CORS response or HTTP 200 is technical access, not permission.

CenterPoint's [streetlight outage guidance](https://www.centerpointenergy.com/en-us/residential/services/electric-utility/outage-center/street-light-outages?sa=ho) directs residents to its map to select a light and enter issue details. The [Houston reporting page](https://sora.centerpointenergy.com/HOU_Sloreporting/) exposes a user form and contact fields. The public MapServer advertises read/query capabilities, not report submission. Searching CenterPoint's public guidance did not find a documented streetlight-submission API or developer onboarding path. Absence from this search is not proof no private integration exists. Person 1 should ask CenterPoint for an official API, partner process, data-use agreement, receipt/status contract and security requirements. Do not inspect form traffic to imitate private endpoints. Until approved, prepare a human-reviewed summary and open the official form; keep `provider_delivery_status=not_sent` and never claim a utility receipt.

## Next work after the spike

Straightforward implementation after the call record and operational limits are available: add the normalized pole contract and `/api/poles` route; configure provider selection; shared cache/rate limits and observability; wire the existing map/list to normalized candidates; add narrowed-area and failure UI; test dense/no-match areas; run physical-device GPS and camera checks. Build provider-specific mapping and tests without changing the report draft's ownership model.

Decisions that require recording or clarification: written record of verbal permission, caching/rate limits and attribution, query/cache limits, stable pole identifier and physical-label mapping, coverage/ownership, and approved programmatic submission or handoff. Backend report persistence, private photos and authenticated session ownership are separate unfinished app work. This branch leaves those decisions open and does not merge into the deployed site's main branch.

## Verification and handoff

Worktree: `/Users/aryanbaki/Documents/ChatGPT/Streetlight-centerpoint-spike`. Base: `origin/develop` at `7c08aa9`. Scope: this document, isolated server adapter, adapter unit tests, browsable preview and inspection route, reused map component, preview styling, and local folder guides. No schema migration or environment variables. The mock tests exercise bounded query parameters, WGS84 normalization, ranking, cache reuse and expiry, truncation, invalid input and spatial-reference failure. The live probes above were intentionally small. Raw responses and exact facility IDs were not committed.

The repo's framework checker, TypeScript check, unit tests, production build and whitespace checks are run and recorded in the task handoff. The preview was inspected at a 390 by 844 browser viewport, including map-label visibility and marker selection. That browser view is a phone-size simulator, not a physical-device test. Production traffic, full-dataset export, official submission, teammate review and Greptile review are not part of this spike. Skills applied: new-feature, code-structure, evidence-driven-testing and unslop under project overrides.


## Pole-number verification and browsable map follow-up

On 2026-09-26, the official layer metadata reported `displayField=FACILITYID` and `drawingInfo.labelingInfo[0].labelExpressionInfo.expression=$feature.FACILITYID`. Three exact IDs visible in the user's screenshot were checked with one bounded query requesting at most four features. Each matched its FACILITYID and returned WGS84 geometry in the shown neighborhood. OBJECTID was a different value. This verifies parity with CenterPoint's displayed pole numbers, not a physical survey of pole tags.

The new map uses the service's native renderer and label placement. The published pole layer is visible at scales closer than 1:10,000; labels appear closer than 1:5,000 and may be suppressed to avoid overlaps. The app tells users to zoom in. All published poles in the visible street-level area can render without the earlier 25 m display restriction. The 25 m bound now applies only to tap inspection. Unmapped assets and current outage status cannot be inferred. The map uses CenterPoint's coordinates and does not claim better source accuracy.

The report preparation flow reuses CameraCapture and its local image normalization. The user confirms a selected pole and issue before reviewing. The summary can be copied and the official form opened in a separate tab. It does not prefill undocumented fields, upload the photo, or claim delivery. There is no durable save in this preview; reload/closing discards the prepared report. Existing demo draft persistence is unchanged.

Validation includes adapter and route unit tests, TypeScript, production build, framework and whitespace checks, and browser inspection of the official symbols, marker lookup and report preparation. Vercel deploys this feature branch as a Preview; main remains unchanged. Shared rate limits, persistent private photo storage, physical-phone camera/GPS verification and approved automated submission remain separate work.
