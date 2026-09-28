# Report flow and branch reconciliation

## Scope

The user authorized fixing desktop/mobile browser reporting, integrating useful branch work into main, and renaming branches. A follow-up explicitly requested keeping branches instead of pruning them. All renamed branches retain their original commits.

Owner: this task, frontend and integration scope. Isolated branch: report-completion. Starting main: 4311953. No open GitHub pull requests were returned by the repository API. Teammate and Greptile reviews were not run.

## Report behavior

A street-level map tap on the initial desktop Report screen previously changed coordinates without entering the location step. Confirmation was hidden and Review report stayed disabled. Both the Report screen and Map tab now open location confirmation. GPS and manual-coordinate actions also enter that step.

Pole confirmation appears above the optional desktop photo upload. Adding a photo to a manually selected location preserves its confirmed pole instead of replacing it with GPS. Photo-first uploads still request location. Desktop and phone browsers share the review, local save, and reopen flow.

Saving remains browser-local IndexedDB storage. It is not utility submission or cross-device synchronization. CenterPoint reporting opens separately, and provider delivery remains not_sent. Physical iOS/Android camera and GPS were not tested.

## Branch decisions

| Previous name | Current name | Integration decision |
| --- | --- | --- |
| codex/3d-map-layers-0927 | 3d-map-layers | Already in main |
| codex/camera-first-0926 | camera-first-reporting | Already in main |
| codex/clean-ui-0926 | simplified-report-interface | Already in main |
| codex/live-map-0926 | live-streetlight-map | Already in main |
| codex/readme-map-plan-0925 | readme-map-plan | Merge README display fix; retain newer app documentation |
| codex/vercel-phone-preview-0926 | phone-preview-deployment | Already in main |
| codex/web-0926 | desktop-map-and-drafts | Already in main |
| feature/centerpoint-integration-spike | centerpoint-integration | Already in main |
| feature/photo-streetlight-identification | photo-streetlight-identification | Already in main |
| frontend | web-and-native-prototype | Preserve mobile/shared prototype; retain current Next.js UI |
| map-data | streetlight-data-export | Already in main |

main remains the release branch; develop remains the integration branch. Local-only prefixed branches were renamed agent-workflow, map-report-release and supabase-environment. Future branch names use descriptive words without codex/ or feature/ prefixes.

The older frontend had a competing Next.js implementation and a separate Expo companion. Its web design was superseded by the camera/map app; its illustration was already integrated. The merge preserves the Expo companion and shared prototype schema, adds its five validation tests, and supplies a separate mobile lockfile. Root web installs do not install Expo. See [mobile setup](../mobile/README.md). Native runtime/device behavior remains unverified.

## Evidence

Environment: macOS, bundled Node.js 24, npm 11, Chromium. Baseline: 4311953; tests cover report-completion and the changes recorded by this release. Development port 3117 and production test port 3118 belong to this isolated worktree.

The new desktop map-first test failed before the fix because Confirm the streetlight never appeared. After the fix, both 1440 px desktop and 390 px phone scenarios select a pole, review, save, reload and reopen. The desktop scenario also attaches a synthetic image without losing selection. Before/after screenshots are retained in ignored .artifacts/report-completion/ and were inspected in the browser.

Checks: root npm ci, web and Expo TypeScript checks, 25 unit tests, 19 browser tests, Next.js production build, framework checker, and whitespace checks. The browser suite uses synthetic provider responses and images; a manual browser check also confirmed that a live map tap reaches review. No test sends a report to CenterPoint.

Dependency install reports two moderate root development advisories and thirteen moderate entries in the retained Expo prototype. No forced major-version changes were applied. Expo is not part of the deployed web dependency tree.

Production follows main at [the existing Vercel site](https://houston-streetlight-reporting.vercel.app). Roll back with a normal revert or the previously verified Vercel deployment; do not reset shared history or erase local drafts.

Skills applied: new-feature, code-structure, evidence-driven-testing, before-and-after, and unslop under the repository overrides.
