# Desktop map and report cleanup

Owner: Codex, frontend integration across Persons 2 and 3. Review partners: Person 5 for frontend and Person 4 for map data. No teammate review has occurred.

## Branch integration

Base: main 4c77a0f. Task: codex/web-0926 in the separate Streetlight-web-0926 worktree. The original checkout and other agents' worktrees were left untouched. Created develop at the existing main commit because it was absent. GitHub returned no open pull requests before editing.

The exporter branch codex/test-streetlight-export at 0aefce6 is already an ancestor of main. The camera and Vercel branches are also incorporated. They do not need another merge.

Selected the generated neighborhood illustration and desktop entry pattern from Person 3's branch at 03a9487. Kept the working camera component, ArcGIS map, report controller, and IndexedDB format. This is a selective integration, not a full merge of the alternate frontend or its Expo workspace. Its separate app, dependencies, and report store remain on that branch.

## Behavior

- Desktop introduction with Get started and Explore the map.
- Desktop map beside scrollable location controls; mobile controls below the map.
- Map opens with fixed sample candidates, even before location permission is requested.
- Removed slogans and redundant introductory text.
- Renamed My reports to Saved drafts. Existing records, editing, deletion, and photo-free drafts remain available without accounts.
- Official CenterPoint map link beside the sample-data label.

No server schema, API, provider submission, or database changes. Every saved draft remains not_sent. No real resident data or provider records are included.

## Source data check

On September 26, 2026, the [live layer metadata](https://sora.centerpointenergy.com/arcgis/rest/services/SORA/SLO_REPORTING_HOU_MERCATOR/MapServer/0?f=pjson) still returned Streetlights, JSON/GeoJSON/PBF support, FACILITYID, OBJECTID, and a 2000-record service cap. Description and copyright fields were empty. This confirms the JSON path, not reuse permission. The existing bounded exporter remains the research tool; no scraping or region-wide download was performed. The [data assessment](arcgis-data-assessment.md) remains applicable.

## Verification

Environment: macOS, Node 24.19.0, Python 3.12 in a task-local virtual environment, Chromium browser automation and the Codex in-app browser. Tested base plus the uncommitted task diff. Local preview is served by this worktree on port 3106.

- TypeScript check passed.
- Nine frontend unit tests passed.
- Eighteen exporter tests passed using requests 2.34.2. Initial system-Python runs lacked requests; a task-local environment resolved the prerequisite.
- Five existing browser tests passed after the history label update.
- Added desktop/mobile layout test passed: automatic candidates, two-column geometry, selection preserved across resizing, stacked phone controls, and no horizontal overflow.
- Live browser: saved a synthetic no-photo draft, reloaded, and verified it in Saved drafts at 390 x 844. Inspected map and introduction at 1440 x 900.

Local screenshot evidence is under ignored .artifacts/web/: before-desktop.png, after-desktop-home.png, after-phone.png, after-phone-drafts.png, and after-desktop-map.png. These are actual browser captures, not a recording. No evidence was uploaded externally.

Production build and framework/link checks passed; both staged and unstaged whitespace checks passed. Greptile: not run, no configured integration. Physical phone camera/GPS and provider data reuse remain unverified. Dependency installation reports two moderate advisories in vitest and @vitest/mocker; no dependency versions were changed by this task.

Skills applied: new-feature, code-structure, before-and-after, evidence-driven-testing, and unslop, under AGENTS.md overrides. Rollback: revert the integration commit; the existing local draft data format is unchanged.
