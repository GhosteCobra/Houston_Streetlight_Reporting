# Frontend verification

Revision under test: feature branch `codex/camera-first-0926`, based on `origin/main` `0aefce6`. Tested on macOS with Node 24.19.0, Next.js 16.3.6, Chromium 153, local development server, and synthetic pole/photo/camera data.

## Results

The bundled environment had no `npm` executable, so the installed package CLIs were invoked directly (the package scripts point to these same commands).

- `node node_modules/.bin/tsc --noEmit`: passed.
- `node node_modules/.bin/vitest run`: passed, 9 unit tests for WGS84 validation, demo data boundaries, evidence-based ranking, and unsubmitted draft status.
- `node node_modules/@playwright/test/cli.js test`: passed, 4 browser tests: camera denied/upload fallback; photo → confirmed demo pole → review → local save → reload/edit; denied GPS/invalid coordinates/manual location; camera tracks stop on navigation. These ran against the production server at localhost:3000 with a 390×844 Playwright viewport.
- `python3 scripts/check_framework.py`: passed after local docs were added.
- The existing bounded-exporter suite: 18 tests passed with Python 3.12. The environment lacks its `requests` dependency, so the test process supplied a minimal `requests` interface; every transport call is mocked by the suite and no network access was made. No real asset records were committed.
- `git diff --check`: passed.
- `node node_modules/next/dist/bin/next build --webpack`: passed; production routes `/` and `/report` were prerendered. Turbopack build stalled on ArcGIS compilation; the documented build script selects webpack.
- Greptile review: not run; the configured reviewer is unavailable in this environment.

The camera and GPS browser cases mock denied permissions. The stream cleanup case uses a generated canvas stream. These tests verify app handling and state cleanup, not physical-device camera, compass, or GPS accuracy. A physical phone pass remains for the team.

The CenterPoint browser probe read layer metadata only from a temporary local page. A separate one-record bounded query verified that point coordinates and `FACILITYID` are returned. No full pole export, utility report, or real submission was performed.
