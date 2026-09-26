# Streetlight exporter test report

Result: the corrected bounded exporter passes 18 offline tests and a live export probe. The original failing version remains in commit 8e0ece1f6f70df1a510a8cfc5fd0dfbdaf20afe1. No provider records were committed.

## Task and environment

- Request: test on a new branch, fix the errors, and merge into main if it works.
- Owner: Codex; scope is the exporter, offline tests, and test documentation.
- Branch: codex/test-streetlight-export; original base main commit 24936b136815e010d4cbedc714af18f594c24dfc.
- Worktree: existing isolated readme-name checkout, reused after its previous task completed.
- Environment: Windows PowerShell, Python 3.12, requests 2.34.2 installed in ignored .artifacts/python-deps.
- Skills: new-feature, evidence-driven-testing, unslop, under AGENTS.md overrides. Code-structure was reviewed; no product API or shared data contract changed.
- Open pull requests: none at start of the fix. Person 4 is the documented map/data review partner. Teammate review and Greptile: not run. The user authorized this task's verified main update.

## Root cause and correction

On September 25, 2026, the old SLO_REPORTING_WEB_MERCATOR service returned HTTP 200 containing ArcGIS error 404, "Service not found". Checking HTTP status alone cannot detect this ArcGIS error.

The [provider directory](https://sora.centerpointenergy.com/arcgis/rest/services/SORA?f=pjson) lists SLO_REPORTING_HOU_MERCATOR. Its [streetlight layer](https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer/0?f=pjson) is layer 0, an esriGeometryPoint layer supporting GeoJSON, with maxRecordCount 2000. The former URL used a missing service and layer 3. The exporter now uses the verified URL and accepts --layer-url for an explicitly selected replacement.

The original offline run had five passes and three failures: incomplete batches were accepted, malformed collections became empty batches, and CSV property names could collide with coordinate columns. All three failures now pass. The exporter checks requested and returned IDs, respects the layer record cap, validates point geometry, and preserves colliding properties under unique source_ column names.

## Bounded export behavior

Running without arguments checks metadata only. Export requires a WGS84 --bbox and defaults to a 1000-record cap. The cap is applied to candidate IDs before feature downloads; large areas must be narrowed. Queries request only the object ID and FACILITYID when present, excluding unrelated source fields. Object IDs are not treated as physical pole numbers.

The server returned one candidate just outside the exact bounding box in the first live probe. The corrected exporter validates complete candidate retrieval, then filters coordinates to the exact requested WGS84 envelope. It reports exclusions. Generated files default to ignored .artifacts/exports/.

## Verification

- Offline: `python -X utf8 -m unittest discover -s tests/unit -p test_streetlight_export.py -v` passed all 18 tests. Synthetic tests cover successful outputs, API/HTTP errors, empty IDs, pagination limits, malformed/incomplete/duplicate responses, layer and geometry validation, coordinate collisions, metadata-only default, record cap, and exact area filtering.
- Live: metadata, bounded ID query, GeoJSON retrieval, and both serializers passed for bbox [-95.371, 29.758, -95.368, 29.761], with a 100-record cap. The server returned 78 candidates; one outside point was excluded; 77 GeoJSON features and 77 CSV rows were verified, all inside the envelope.
- The live test patched output paths into a TemporaryDirectory and removed the data on exit. Only aggregate counts and errors are reported here.
- Local before/after logs are in ignored .artifacts/export-tests.txt, .artifacts/layer-probe.txt, .artifacts/export-tests-fixed.txt, and .artifacts/live-export-fixed.txt.
- Repository verification uses `python -X utf8 scripts/check_framework.py`, `git diff --check`, and `git diff --cached --check`.

See [usage instructions](../scripts/README.md) and [tests](../tests/unit/test_streetlight_export.py).

## Limits

This is a standalone research utility, not an application integration or authorized bulk dataset import. A successful public query does not establish redistribution rights. Full-region extraction, concurrent source edits, retry/resume, and transactional publication of the two output files were not tested. If an output write fails, the command fails but an earlier output may remain. Establish provider approval and provenance before retaining or sharing a dataset. No utility report was submitted.
