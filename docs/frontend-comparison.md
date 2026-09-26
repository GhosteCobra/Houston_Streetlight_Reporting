# Frontend comparison and release decision

On 2026-09-26 the user authorized comparing the frontend branches, selecting the better fit, combining it with Vercel setup, and delivering the tested result to main.

## Branches inspected

| Branch / revision | Current work | Decision |
| --- | --- | --- |
| main / 0aefce6 | Documentation and bounded data-export tooling; no web app | Release target |
| codex/person3-streetlight-check-0925 / 03a9487 | Next.js web UI and Expo companion | Preserve for later native and navigation work |
| codex/camera-first-0926 / c64ca1e | Camera-first web flow, ArcGIS map, local editable drafts | Selected frontend |
| codex/vercel-phone-preview-0926 / feff38e | Vercel configuration and phone guide | Integration branch |
| codex/readme-map-plan-0925 / 237f99f | README presentation and map planning changes | Separate documentation work, not included |
| codex/test-streetlight-export / 0aefce6 | Bounded exporter already in main | Preserved |

No remote pull-request refs were advertised. The GitHub connector is unavailable in this session, so open PR metadata/review state could not be checked. The earlier PR creation attempt returned HTTP 403. Main is updated only through a normal fast-forward push, as explicitly authorized, without changing anyone else's checkout.

## Comparison

| Area | Person 3 | Camera frontend |
| --- | --- | --- |
| Navigation | Home, Map, Report, My reports as routes; clearer desktop landing page | Opens directly into reporting; Map/Report/My reports tabs |
| Phone camera | Capture-hinted file picker | Live preview, camera switch, capture, fallback upload, stream cleanup |
| Mapping | Synthetic schematic and list | ArcGIS/OSM map with adjustable pin and synthetic candidate list |
| Photo handling | Tab-only preview; photo is not saved | Decodes, resizes, re-encodes and saves with local draft |
| Persistence | Local report details in localStorage | Editable drafts with photos in IndexedDB |
| No photo | Already supported | Added and verified during integration |
| Native app | Expo companion; camera/GPS pending | Browser only |
| Backend | None | None |
| Automated checks | Lint, web/native types, five unit tests, production build | Types, nine unit tests, five browser tests, production build; no lint script |

Choose the camera frontend for the immediate goal: opening the website on real phones and testing camera, location, map confirmation and retained drafts. Person 3's work is functional and useful; it is not discarded or merged wholesale into a competing application. The Expo companion is unnecessary for Vercel browser testing.

The selected UI still uses DEMO poles. It does not recognize images, retrieve live utility assets, authenticate users, sync teammates' reports, upload to Supabase, or submit to CenterPoint. A finished frontend prototype is not a finished reporting system.

## Integration changes

Merged c64ca1e into the Vercel branch. Added nullable photos across draft validation, review, save and history. Added a no-photo browser regression. Excluded the hidden file picker from full-width form-input styling to eliminate horizontal page overflow at 390 pixels. Added an optional PLAYWRIGHT_BASE_URL override to test this task's own server on port 3101 without touching the other agent's port 3000.

The nullable field is backward compatible with existing photo drafts. No server API, database or storage policy was changed. No real resident data or secrets were used.

## Verification

Environment: macOS, Node 24.19.0, npm 11.6.0 invoked from a temporary directory, Chromium; production servers on ports 3101 and 3102 in isolated checkouts. Evidence covers the integration merge plus the uncommitted changes recorded in this release commit.

- Both branches: clean npm ci and production build passed.
- Person 3: Next route type generation, web and Expo TypeScript checks, lint, and all five unit tests passed. Manual browser walkthrough completed no-photo, confirmed coordinates, issue, review and local save.
- Selected integration: typecheck, nine unit tests, production build and all five Playwright browser tests passed. Tests cover camera denial/upload, photo save/reopen/edit, GPS denial/manual coordinates, synthetic camera cleanup, and no-photo save/reopen/edit.
- A first new test failed because its exact button label omitted the draft-count badge. Fixed the locator. An intermediate run overlapped a rebuild and is invalid; the final five-test pass ran against the completed build after restarting this task's server.
- Mobile viewport probe: Person 3 390/390 viewport/page width; camera before fix 390/408; after fix 390/390. Screenshots retained locally under ignored .artifacts/comparison/. Images were reviewed; they show actual running apps.
- npm audit: selected app has zero production advisories and two moderate development dependency entries. Person 3 install reports thirteen moderate entries. No forced major dependency upgrades were applied.
- Framework checker and whitespace checks run before commit; exact output recorded in task.

Physical iOS/Android camera, GPS accuracy, native Expo device behavior and cross-session backend security are untested. Greptile and teammate review were not run. The user authorized this release; no reviewer approval is claimed.

## Hosting and rollback

Vercel project: streetlight-checker/houston-streetlight-reporting. Production tracks main. Domain: https://houston-streetlight-reporting.vercel.app. No environment variables are required for this local demo. Verify Vercel's deployed commit and Ready status after the push; an earlier Ready deployment of 0aefce6 did not contain the frontend.

Rollback through a reviewed revert of the release changes or Vercel's previous verified deployment. Do not reset shared branches. Browser drafts are tied to their origin, so a preview URL and production URL have separate local data.

Owner: this task, deployment and integration scope; Person 3 is the frontend review partner, Person 4 for future persistence. Skills: new-feature, evidence-driven-testing, before-and-after and unslop with repository overrides. The original camera owner had completed and pushed its isolated branch before integration.
