# Streetlight exporter test report

Result: not ready to merge. The supplied script is preserved unchanged in [scripts/streetlight_export.py](../scripts/streetlight_export.py). No provider records were downloaded or committed.

## Task and environment

- Request: test the pasted script on a new branch; merge into main only if it works.
- Owner: Codex, scoped to the exporter, offline tests, and test documentation.
- Branch: codex/test-streetlight-export, based on main commit 24936b136815e010d4cbedc714af18f594c24dfc.
- Worktree: existing isolated readme-name checkout, reused after the previous task completed.
- Environment: Windows PowerShell, Python 3.12, requests 2.34.2 installed in ignored .artifacts/python-deps.
- Applicable skills: new-feature, evidence-driven-testing, unslop, under AGENTS.md overrides. Code-structure was reviewed; no shared abstraction or product interface changed.
- Open pull requests: none at task start. Review partner: Person 4 per map/data ownership; teammate review and Greptile were not run.

## Live metadata probe

On September 25, 2026, calling the supplied get_layer_info() reached an ArcGIS JSON error: code 404, message "Service not found". The script raised RuntimeError before requesting IDs or downloading features. The URL redirected from gis.centerpointenergy.com to sora.centerpointenergy.com in the web probe; no working replacement layer was verified.

This establishes failure for this endpoint at test time. It does not establish that another endpoint works or that dataset reuse is permitted. Full export, actual feature schema, provider permissions, and regional coverage remain unverified.

## Offline acceptance results

Command: `python -X utf8 -m unittest discover -s tests/unit -p test_streetlight_export.py -v`

Eight synthetic-data tests ran: five passed and three failed. Tests intercept every HTTP request and write only to temporary directories.

| Check | Result |
| --- | --- |
| Complete synthetic export creates matching GeoJSON and CSV | Pass |
| ArcGIS error stops before outputs | Pass |
| HTTP failure propagates | Pass |
| Empty IDs stop before outputs | Pass |
| Multiple complete batches retain all features | Pass |
| Reject incomplete export / transfer-limit response | Fail: the script reports completion and saves one feature for two requested IDs |
| Reject a response without a features collection | Fail: malformed response is silently treated as an empty batch |
| Avoid latitude/longitude property collisions | Fail: duplicate CSV headings; source properties can overwrite geometry coordinates |

The failures are retained as ordinary failing acceptance tests, not marked as expected passes. The successful synthetic flow does not prove a live export works.

## Reproduce

Use Python 3.9 or newer with requests installed in a local virtual environment. The tested requests version was 2.34.2. Run the unit command above from the repository root. For the existing worktree-local installation in PowerShell, set `$env:PYTHONPATH = Join-Path (Get-Location) '.artifacts/python-deps'` first.

The read-only live probe is `python -X utf8 -c "from scripts.streetlight_export import get_layer_info; get_layer_info()"`. Do not run the script's main entry point until the layer, bounded extraction scope, and dataset approval are established. The supplied main entry point requests every object ID and writes exports into the current directory.

Raw test and probe output is retained locally under ignored .artifacts/export-tests.txt and .artifacts/layer-probe.txt. No raw provider data is included in this report.

## Merge decision

Do not merge this branch into main. Verify an authorized working layer, add completeness and response validation, and resolve coordinate-column collisions before repeating these tests and a bounded live export. A full-layer export also needs documented scope and provenance under the repository data rules. No feature, schema, or provider submission integration was added.
