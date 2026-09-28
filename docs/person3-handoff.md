# Person 3: Streetlight Check UI

Historical handoff for commit 03a9487. The current release keeps the Expo companion and shared prototype model; its older competing Next.js UI is superseded by the camera/map web application. Use [current setup](local-frontend.md) for the web app and [mobile setup](../mobile/README.md) for Expo. Commands and branch names below describe the original prototype only.

Owner: Person 3, frontend/UI. Git commit identity: Charan Sai Saragadam.
Task branch: `codex/person3-streetlight-check-0925`.
Initial base: `24936b1` on main. Teammate exporter updates through `0aefce6` were merged into this branch before final verification; develop did not exist at task start. No open PRs were returned by the repository overlap check.

The current user request explicitly selects a Next.js + Tailwind web application alongside React Native + Expo + Expo Router + TypeScript. It supersedes the older mobile-only pasted handoff. This branch keeps the main web application in the planned `src/` structure and puts the native companion in the `mobile/` npm workspace. Both consume `shared/report.ts` and one root lockfile.

The root README and the existing team guides remain intact. No merge to main is part of this task.

## Run

Use Node.js 24 LTS and npm. From the repository root:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. No credentials or environment file are required for the local demo.

```bash
npm run mobile
```

This starts Expo. Use a compatible Expo Go client or development build for SDK 57. `npm run web --workspace mobile` opens the companion's Expo web build; Next.js remains the primary web application.

## Scope

The web app implements home, sample pole map/list, optional local photo preview, issue selection, confirmed coordinates, review, duplicate warnings, local save, confirmation, and report history. Browser geolocation has a manual fallback. JPG, PNG, and WebP previews are limited to 10 MB. No photo bytes leave the tab or enter storage.

The native companion implements home, sample pole list, manual coordinates, issue selection, review, duplicate warnings, local save, and confirmation. Its photo-free path is explicit. Native camera and GPS integration remain for their owners. Android, iOS, and Expo web bundles are produced from the same Expo Router routes.

The map is a labeled schematic with synthetic DEMO-prefixed poles. It does not perform geocoding, GPS matching, image recognition, or ArcGIS queries. Status is shown as text as well as color. Browser reports live in localStorage; native reports live in AsyncStorage. They are not synced or official utility receipts. Drafts remain in memory, so refreshing the web report page discards an unsaved draft.

## Integration boundaries

| Owner | Handoff |
| --- | --- |
| Person 2 | Replace the sample map with ArcGIS. Consume `Pole` values and emit selected poles. The form owns the draft. |
| Person 4 | Review `reportInputSchema`, then replace the local demo stores with authenticated API adapters. Implement server validation, session ownership, durable idempotency, private uploads, and status updates before real use. |
| Person 5 | Replace the basic web file inputs with the camera component and integrate native photo/GPS capture. Inputs emit values; they do not submit. Verify physical devices and add CI/deployment. |
| Person 1 | Review provider messaging and approved handoff mechanisms. Provider delivery remains `not_sent`. |

`ReportInput` follows the existing proposed data contract. `DemoReport` is a separate, explicitly local record; it does not pretend to be the server response. Local confirmation IDs have a DEMO prefix. Local persistence is not an authentication or privacy boundary. No API endpoint, Supabase service, utility integration, or deployment is claimed by this branch.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run export --workspace mobile
python scripts/check_framework.py
git diff --check
```

On Windows, set `PYTHONUTF8=1` if the documentation checker uses a legacy code page. The five unit tests cover required confirmation, coordinate limits, optional pole/photo, explicit demo delivery, and duplicate boundaries.

The Codex in-app browser was used at 1440 × 1000 and 390 × 844 for the primary flow. Actual checks and remaining limits are recorded in the PR. There was no runnable baseline UI in the base commit. Do not represent the supplied design references as screenshots of a previous implementation.

Dependency audit: npm reports 13 moderate dependency entries from two underlying transitive advisories, `decode-uri-component` via Expo Router and `uuid` via Expo's Xcode tooling. Nonbreaking audit fixes were applied. npm's remaining suggested fixes downgrade Expo/Router across major SDK versions, so those were not applied. Native device testing and deployment approval remain pending.

## Design and evidence

The supplied images define warm cream, navy, mint and lavender colors, large rounded controls, and bottom navigation. The desktop adaptation uses an illustrated neighborhood behind the home copy. The illustration was generated with the built-in image tool and committed as `public/images/neighborhood.png`; no resident photo or external stock asset is included.

The illustration brief was: remove text, logo, navigation and buttons from the desktop concept; preserve the cream sky, navy streetlamp, watercolor neighborhood, sage trees, and lavender Houston skyline as a standalone background. All interactive text and controls are rendered in code.

Intentional differences from the references: consistent Home/Map/Report/My reports navigation; synthetic pole IDs; user-confirmed location instead of an invented automatic match; local demo saving instead of a CenterPoint submission claim; an honest empty photo state until an image is chosen. The native map starts with an accessible pole list until Person 2 supplies its implementation.

Loaded guidance: repository new-feature, code-structure, evidence-driven-testing, before-and-after, and unslop under AGENTS.md overrides; frontend-app-builder, frontend-testing-debugging, react-best-practices, and imagegen. Greptile was not run because no integration was available or configured.
