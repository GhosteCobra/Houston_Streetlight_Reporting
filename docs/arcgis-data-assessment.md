# CenterPoint Houston ArcGIS data assessment

Inspected September 26, 2026 for the camera-first frontend. Decision: **use synthetic poles through a replaceable adapter; do not connect the application to the utility dataset yet.** Technical visibility is not a reuse license.

## Public surface examined

- [Official Houston reporting map](https://sora.centerpointenergy.com/HOU_Sloreporting/)
- [Map service metadata](https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer?f=pjson)
- [Streetlights layer 0 metadata](https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer/0?f=pjson)

The reporting page displays CenterPoint branding, address/streetlight-number search, and Esri attribution. No report was submitted. Layer metadata identifies `Streetlights`, `esriGeometryPoint`, capabilities `Map,Query,Data`, and JSON, GeoJSON and PBF query formats. `maxRecordCount` is 2,000, which is a service limit, not permission to paginate through the dataset.

## Fields and geometry

`FACILITYID` is a string field (length 50), separate from the internal `OBJECTID`. It supplies an asset identifier suitable for further provider validation; metadata alone does not prove it exactly matches every number printed on a physical pole. Other fields include `FIXTUREWATTAGE`, creation/update metadata and source IDs. There is no address field in the inspected field list.

Source spatial reference is WKID 103161, latest WKID 6588. A deliberately bounded query requested one record from a small downtown envelope (`-95.370,29.759,-95.369,29.760`) with `inSR=4326`, `outSR=4326`, `outFields=FACILITYID`, `returnGeometry=true`, and `resultRecordCount=1`. It returned one feature with `FACILITYID` and point `x/y` in WGS84. No complete dataset was downloaded, copied or committed. Raw identifiers and raw response files are excluded from Git.

## Browser access and usage conditions

A curl request with origin `http://localhost:3000` received HTTP 200 and `Access-Control-Allow-Origin: http://localhost:3000`. A Python HTTP client received HTTP 403, so access behavior differs between clients. An actual cross-origin `fetch` from a temporary page at `http://localhost:3000` also returned HTTP 200 and readable JSON (`Streetlights`, `esriGeometryPoint`, `FACILITYID`) in the Codex browser. The probe requested layer metadata only and was removed afterward. This confirms access from that tested local origin at that time, not permanent availability, other origins, or reuse permission.

The inspected service/layer description and copyright fields were empty. The visible application did not provide an explicit dataset reuse/redistribution grant. This is **unresolved permission**, not a conclusion that the data is open, licensed for this app, or prohibited. Obtain CenterPoint's approved use terms, identifier mapping, query limits, attribution requirements and allowed origins before enabling a live adapter. Do not bulk export pole IDs based on the visible map.

## Application boundary

The ArcGIS SDK renders an OpenStreetMap basemap and four invented DEMO-prefixed poles. All map/candidate screens label them as demo data. The adapter uses fixed coordinates, not fictional assets generated around a visitor's real GPS. Outside its sample area the app returns no candidates and supports a manually confirmed pin.

The layer's read/query capability is not a reporting API. No authorized reporting integration exists in this repository. All saved items are device-local drafts marked not sent; the official handoff opens a new tab without automatically sharing data.
