# Framework checks

Run `python3 scripts/check_framework.py` from the repository root with Python 3.9 or newer and Git available. It reads tracked and non-ignored untracked files, checks first-party Markdown local file links, code fences, JSON examples and trailing whitespace, and compares imported source bytes with .agents/source-manifest.json.

The source manifest records the user-supplied archive, not an independent authenticity guarantee. The check does not run imported helper scripts, follow external URLs, validate Markdown anchors, or test application behavior. Imported Markdown is preserved as supplied and excluded from first-party formatting/link checks.

Also run `git diff --check` and `git diff --cached --check`. Application checks must be added after the app is scaffolded.

## Bounded streetlight exporter

[streetlight_export.py](streetlight_export.py) checks layer metadata or exports an explicitly selected WGS84 area. Use Python 3.11 or newer for the utility and its tests. Install requests in a local virtual environment; version 2.34.2 was tested.

```bash
python -m pip install requests==2.34.2
python scripts/streetlight_export.py
```

The second command checks metadata only. After confirming dataset approval and the area needed, a bounded export uses:

```bash
python scripts/streetlight_export.py --bbox -95.371 29.758 -95.368 29.761 --max-records 100
```

Outputs are .artifacts/exports/houston_streetlights.geojson and .artifacts/exports/houston_streetlights.csv relative to the current directory. Run from the repository root so they remain ignored. A successful run replaces these outputs. --max-records defaults to 1000 and rejects excess candidates; narrow the area if the cap is exceeded. --layer-url selects a verified alternative point layer supporting GeoJSON. No whole-layer export is performed by default.

Coordinate columns come from point geometry. Colliding source properties are preserved under unique source_ names. The utility refuses missing or unexpected IDs and invalid geometry. It filters any server candidates outside the exact bbox after validating retrieval completeness. FACILITYID is preserved when available; an ArcGIS object ID is not a physical pole identifier.

Read the [test report](../docs/streetlight-export-test-report.md) for results and limitations. Public access does not establish dataset reuse rights; keep provider data out of Git until provenance and permission are documented.
