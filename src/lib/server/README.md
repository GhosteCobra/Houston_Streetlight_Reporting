# Server services

**Owner:** Person 4, with Person 2 for map data. The application has no report backend yet.

`centerpoint/` contains a read-only, research-only streetlight adapter. It is not imported by a route or the browser app. See [the integration spike](../../../docs/centerpoint-integration.md) before enabling live data.

Future report persistence, session checks, photo authorization and provider handoff must keep credentials server-side and enforce the [API contract](../../../docs/api-contract.md). Demo reporting stays `not_sent`.
