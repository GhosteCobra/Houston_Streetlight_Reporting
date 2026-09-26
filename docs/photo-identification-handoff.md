# Photo-to-streetlight confirmation

Person 5 owns this task on `feature/photo-streetlight-identification`, based on `origin/develop` at `7c08aa9`. The isolated worktree is `.worktrees/photo-streetlight-identification`. Person 3 should review report-state integration; Person 2 should review the lookup handoff. No issue number was supplied. GitHub CLI returned HTTP 401 when listing open PRs; the GitHub connector subsequently confirmed that there were no open PRs. A final fetch confirmed that `origin/develop` still matched the base commit. No PR or merge is part of this delivery.

## Behavior and changed files

- `src/components/report/StreetlightApp.tsx`: accepting a usable photo requests GPS, queries the existing pole adapter and ranks candidates. GPS denial, unavailable location and timeout have distinct messages. Lookup failure has retry and manual-pin recovery. Changing photo/location clears the previous pole confirmation. Late GPS and aborted lookup results cannot replace a newer choice.
- `src/components/report/StreetlightSuggestion.tsx`: shows the best ranked candidate, approximate distance, coordinates, available address and ranking reason. "Confirm Streetlight" selects it in the shared report state. "Choose Another" focuses the existing candidate list, whose selection also confirms a pole.
- `src/app/globals.css`: adds the responsive suggestion card using the existing button styles.
- `tests/e2e/photo-identification.spec.ts`: checks automatic GPS, confirmation, alternate selection, save/reopen with photo and pole coordinates, permission/unavailable/timeout fallbacks, stale GPS, replacement/removal, invalid/oversized images, and synthetic capture/retake.
- `playwright.config.ts`: runs browser flows serially because the camera stops on page visibility changes, and enables Chromium sandboxing. Adding a second test file exposed an intermittent existing camera test failure with two workers; the serial run passed all camera checks.
- `src/components/report/README.md`, `docs/local-frontend.md`, and this handoff describe the implemented behavior.

The existing `CameraCapture` and photo normalization code are reused without changes. Preview, capture, upload, retake, removal and no-photo reporting remain available. The selected pole stays in `StreetlightApp`; the existing draft save records its ID and coordinates with the photo. There is no new report schema, database migration, dependency, upload endpoint or storage policy.

## Person 2 integration

Reuse `PoleDataAdapter.nearby(location, signal)` in `src/lib/arcgis/poles.ts`. It accepts WGS84 `{ latitude, longitude }` and an optional abort signal, returning `Promise<Pole[]>`. `rankPoles` already calculates meter distances and uses optional manually entered pole-number/heading evidence. The UI does not contain ArcGIS query code.

At inspection, both latest `develop` and `origin/map-data` lacked a live browser nearby lookup. The map-data branch has the bounded Python export utility, which is not a browser lookup service. This feature therefore reuses the existing four fixed DEMO fixtures within 750 m of downtown Houston. It does not generate fake assets around a resident's GPS location.

When the approved real lookup is ready, Person 2 should implement this adapter and explicitly map provider `facilityId`/`FACILITYID` to normalized `Pole.id`, WGS84 coordinates to latitude/longitude, and optional metadata to the shared pole contract. Reject failed requests rather than returning an empty list; return an empty list only for a successful lookup with no candidates. Honor the abort signal. The controller also ignores late results if the signal was aborted.

Live activation needs coordinated source/provenance changes with Persons 3 and 4: the current `Pole.source` and `Draft.dataSource` contracts accept only `demo`, and existing map/review/save labels describe demo data. Do not label real CenterPoint records as demo or silently change those contracts. This task keeps the demo boundary described in the [data assessment](arcgis-data-assessment.md) and does not enable a provider connection.

## Verification

Environment: Windows, Node 22.14.0, npm 10.9.2, Playwright Chromium; synthetic photos and coordinates only. The local dev server runs from this worktree on port 3105. Checks cover base `7c08aa9` plus this feature's uncommitted diff. Raw screenshots and probe scripts are retained locally in ignored `.artifacts/photo-identification/`.

| Check | Result |
| --- | --- |
| `npm ci` | Passed using the Windows trusted CA bundle; npm reported two moderate dependency advisories. Dependencies and lockfile were not changed. |
| `npm run typecheck` | Passed |
| `npm test` | 9 passed |
| `npm run build` | Passed; `/` and `/report` prerendered successfully |
| Playwright with one worker and Chromium sandboxing | 15 passed, including all 6 existing browser tests |
| Controlled lookup-failure browser probe | Passed: rejected lookup showed retry and manual fallback; retry returned a candidate requiring confirmation. The original adapter bytes were restored afterward. |
| `python -X utf8 scripts/check_framework.py` | Passed; Windows requires UTF-8 mode for the existing checker |
| `git diff --check` | Passed |

For browser tests, start `npm run dev` and then run `npm run test:e2e`. Set `PLAYWRIGHT_BASE_URL` when using a port other than 3000. The local verification used port 3105. Reviewed screenshots include `before-mobile.png`, `before-candidates.png`, `after-mobile.png`, `after-suggestion.png` and `lookup-failure.png` in the artifact directory. These are scripted browser captures, not footage from a physical phone. The failure probe temporarily made the demo adapter reject its first call and restored the source in a `finally` block; it did not contact a provider.

No lint script is configured. Real iOS/Android camera hardware, real GPS accuracy and live CenterPoint lookup remain untested. Supabase, private upload authorization and server persistence are not implemented by this frontend. Photos and drafts remain browser-local, and provider delivery remains `not_sent`. Greptile was not run because no configured review or PR is available.

## Manual checks before opening a PR

1. On a trusted HTTPS preview in iOS Safari and Android Chrome, capture a photo, preview it, retake it, switch cameras and background the app. Check that the camera stops when leaving capture.
2. Upload JPG/PNG/WebP, remove or replace the image, and try an unsupported, corrupt and oversized file. Confirm the no-photo path still reaches review and save.
3. Accept a photo and allow GPS. In the sample area, check the suggestion, distance, "Confirm Streetlight" and "Choose Another". Outside that area, expect no demo matches and use a manual pin.
4. Deny GPS, retry after changing permission, and verify manual coordinates still work. For an older photo, choose its actual location rather than accepting the current GPS location.
5. Choose a different pole, review its ID/coordinates and photo, save, reload and reopen the draft. Change the location/photo and confirm that the old pole is no longer confirmed.
6. Check the layout at phone and desktop widths, keyboard access to the candidate list, and that demo IDs are never presented as real CenterPoint assets or submitted to the utility.

Skills applied: new-feature, code-structure, evidence-driven-testing, before-and-after and unslop, with the repository's overrides. Evidence stays local; no external media upload or teammate message was sent.
