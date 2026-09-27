# CenterPoint adapter

`adapter.ts` performs bounded read-only streetlight queries with WGS84 normalization, caching, coalescing and failure cooldown. The inspection route calls it only for map taps. The provider-specific map component renders the official map-image layer without downloading a regional dataset. See [integration findings](../../../../docs/centerpoint-integration.md).
