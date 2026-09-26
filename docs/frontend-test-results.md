# Frontend verification

Revision under test: feature branch `codex/camera-first-0926`, based on `origin/main` `0aefce6`. Tested on macOS with Node 24.19.0, Next.js 16.3.6, Chromium 153, local development server, and synthetic pole/photo/camera data.

## Results

- `npm run typecheck`: passed.
- `npm test`: passed, 9 unit tests for WGS84 validation, demo data boundaries, evidence-based ranking, and unsubmitted draft status.
- `npm run test:e2e`: passed, 4 browser tests: camera denied/upload fallback; photo → confirmed demo pole → review → local save → reload/edit; denied GPS/invalid coordinates/manual location; camera tracks stop on navigation.
- `python3 scripts/check_framework.py`: passed after local docs were added.
- `python3 -m unittest discover -s tests/unit -p 'test_*.py'`: pending an explicit run of the existing bounded-exporter tests. No real asset records were committed.
- `git diff --check`: passed.
- `npm run build` equivalent (`next build --webpack`): passed; production routes `/` and `/report` were prerendered. Turbopack build stalled on ArcGIS compilation; the documented build script selects webpack.
- Greptile review: not run; the configured reviewer is unavailable in this environment.

The camera and GPS browser cases mock denied permissions. The stream cleanup case uses a generated canvas stream. These tests verify app handling and state cleanup, not physical-device camera, compass, or GPS accuracy. A physical phone pass remains for the team.

The CenterPoint browser probe read layer metadata only from a temporary local page. A separate one-record bounded query verified that point coordinates and `FACILITYID` are returned. No full pole export, utility report, or real submission was performed.
