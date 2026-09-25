# Houston Streetlight Reporting

A mobile-first, camera-first web app planned as a hackathon project to help residents report streetlight problems in Houston, Galveston, and the surrounding area safely and accurately.

**Status: planning and documentation.** This repository contains the project README, five role guides, implementation-folder guides, shared contracts, and collaboration templates. Application code, sample datasets, executable tests, CI, and deployment remain planned; there is no runnable application yet.

## Start building

Coding agents must read [AGENTS.md](AGENTS.md) first. The [agent startup guide](docs/agent-workflow.md) explains the team process, and the [bundled skills](.agents/README.md) preserve the supplied skills-main.zip with project-specific overrides.

Use the [team documentation index](docs/README.md) to navigate the framework. Start with your [role guide](docs/roles/README.md), then claim a task from the [implementation backlog](docs/backlog.md).

| Guide | What it covers |
| --- | --- |
| [Requirements](docs/requirements.md) | MVP behavior and scope boundaries |
| [Architecture](docs/architecture.md) | Module responsibilities and handoffs |
| [Data contract](docs/data-contract.md) / [API contract](docs/api-contract.md) | Proposed shared fields, endpoints, errors, and access rules |
| [Setup](docs/setup.md) | Application bootstrap and configuration checklist |
| [Contributing](CONTRIBUTING.md) | Issues, branches, review, and completion criteria |
| [Test plan](tests/README.md) | Success, fallback, retry, and access-control scenarios |
| [Deployment](docs/deployment.md) / [Demo](docs/demo.md) | Release checks and presentation flow |

Every implementation folder contains a README with its purpose, owner, planned files, and working rules. Proposed defaults in the contracts are a starting point for team review, not implemented behavior.

## Why we are building this

Someone who notices a broken streetlight may not know its pole number, exact address, or responsible utility. Our goal is to turn a location, photograph, and issue description into a structured report that the resident can review and use with the appropriate reporting provider.

The prototype will combine a streetlight map, pole IDs linked to GPS coordinates, photo upload, issue selection, duplicate warnings, and report tracking. We will demonstrate the complete flow with sample data before pursuing an approved utility integration.

This is an independent student hackathon project, not an official CenterPoint Energy service. A report saved in our demo does not mean that a utility has received it or scheduled a repair.

## Research behind the project

The team discussed the idea and documented a call with a CenterPoint representative in the [original planning conversation](https://chatgpt.com/share/6ab6d483-45f4-83ea-83a5-3ddfbe7966f6).

According to that call:

- Residents can report through CenterPoint's website or by phone.
- A pole number and an exact address or location help identify the light.
- The representative said their reporting process did not accept photos or videos.
- Reports involve address verification, recording the issue, and assigning a crew to inspect it.
- Repair time depends on the issue; completion notifications may be available.

These are interview findings, not a written policy or an integration agreement. The call did not establish API access, bulk submission, data licensing, or permission to submit reports automatically.

For the provider's own reporting information, see [CenterPoint's streetlight outage reporting page](https://www.centerpointenergy.com/en-us/residential/customer-service/electric-outage-center/report-streetlight-outages?sa=ho). Confirm current requirements with the provider before implementing an integration.

## Planned reporting flow

The main experience is **open the website → take a picture → confirm the suggested report → submit**. No app-store installation is required. Automate location lookup and report preparation while keeping one short review step to correct the pole or issue.

1. **Open the site and tap “Take a photo.”** Use the phone camera or choose an existing image. A passenger can report, or a driver can wait until safely parked.
2. **Capture location with permission.** Request browser GPS near capture time, record its accuracy, and offer manual location entry if it is unavailable. An older uploaded photo needs its location confirmed separately.
3. **Prepare the report automatically.** Suggest nearby poles from the available dataset, resolve an address when possible, and check for duplicates. Load the map when needed to confirm or correct the location.
4. **Confirm the issue.** Show the photo, suggested pole, address, and a short issue selector: light out, flickering, damaged pole, leaning pole, exposed wires, or other. Photo-based classification is later work; a photo alone cannot reliably establish every issue.
5. **Review and submit.** Validate the details, save the report and photo, and return an internal confirmation ID. Show success only after the save succeeds.
6. **Show the next step.** Display demo status and a prepared summary/link for the official reporting process. Only an approved future integration may claim successful delivery to a utility.

Potential emergencies must be distinguished from routine outages. The demo is not an emergency reporting service; the interface should direct users away from damaged equipment and toward emergency services when there is immediate danger.

GPS proximity alone does not prove which pole is affected. A photograph may lack location metadata or may have been taken elsewhere, so location and pole selection need user confirmation.

## MVP scope

| Planned capability | Expected result |
| --- | --- |
| Interactive map | Display sample streetlights and a clear status legend |
| Pole/location data | Connect each pole ID to latitude, longitude, and an address when available |
| Location capture | Support GPS and manual correction |
| Photo upload | Preview and validate a sample image |
| Issue selection | Capture a consistent issue type and optional description |
| Duplicate detection | Warn about a possible existing report for the same pole or nearby location |
| Review and confirmation | Let users verify details and receive an internal report ID |
| Status view | Display clearly labeled demo report progress |
| Provider handoff | Prepare a report summary and link to the official reporting channel |

**Later work:** pole-number OCR, photo-based issue suggestions, approved live streetlight data, verified provider routing, and authorized report submission/status updates. OCR and image suggestions must remain reviewable by the user.

## Recommended tech stack

Use one TypeScript web application with managed database and storage services for the five-person MVP. **ArcGIS is the selected mapping direction; the rest of this stack is the recommended implementation plan, not installed software.** Pin compatible stable versions and a supported Node.js LTS release when scaffolding, and commit the npm lockfile.

| Layer | Recommended technology | Project use |
| --- | --- | --- |
| Web app | Next.js App Router, React, TypeScript | Mobile pages, camera flow, report review, and server endpoints in one repository |
| Styling | Tailwind CSS | Responsive layouts, large touch targets, and consistent UI styles |
| Mapping | ArcGIS Maps SDK for JavaScript (`@arcgis/map-components`, `@arcgis/core`) | Basemap, pole markers, nearby candidates, and location correction |
| Camera | HTML file input first; MediaDevices API for a later custom camera | Capture with the phone camera or choose an existing photo |
| Location | Browser Geolocation API; ArcGIS geocoding when configured | Capture coordinates and accuracy, then suggest a nearby address |
| API and validation | Next.js Route Handlers + Zod | Validate report payloads, authorize uploads, check duplicates, and save reports |
| Database | Supabase PostgreSQL | Store poles, reports, and internal status history; add PostGIS for spatial queries as needed |
| Photo storage | Supabase Storage, private bucket | Store images separately from report rows; issue temporary authorized viewing links |
| Identity | Supabase Auth | Anonymous sessions for low-friction reporting, with authenticated access for team/admin tools |
| Deployment | Vercel + hosted Supabase | Host the web app/API and maintain separate demo/preview data from any future live environment |
| Quality | ESLint, Prettier, Vitest, Playwright, GitHub Actions | Formatting, type checks, logic tests, reporting-flow tests, and CI builds |
| Collaboration | GitHub Issues and pull requests | Apply the feature → develop → main workflow below |

This keeps the UI and API together while giving the map, form, backend, and photo owners clear modules. Use mock poles first; neither AI image analysis nor a native mobile app is required to demonstrate the core flow.

Implementation references: [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [ArcGIS web SDK setup](https://developers.arcgis.com/javascript/latest/get-started/), [Supabase PostGIS](https://supabase.com/docs/guides/database/extensions/postgis), and [Next.js hosting on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs).

### ArcGIS and CenterPoint's map

The team identified ArcGIS as the technology behind the CenterPoint streetlight map. Use the ArcGIS SDK for our own map, but verify the actual CenterPoint layer/service URL, accessible fields, and permitted usage before connecting to its data. Using the same GIS platform does not provide access to its assets or a report-submission API.

- Begin with synthetic pole records rendered in our map. Replace the data source through a small adapter when an approved dataset or service is available.
- If an authorized ArcGIS feature service is provided, map its asset identifier, geometry, and address fields into our shared pole schema. Do not assume an ArcGIS `OBJECTID` is the utility's physical pole number.
- Normalize coordinates to WGS84 latitude/longitude. Check spatial reference and coordinate order; GeoJSON uses longitude before latitude.
- Query a bounded map area or nearby radius, request only needed fields, and handle pagination/service limits. Do not fetch an entire regional dataset on every page load.
- Keep provider submission separate from GIS reads. Reading a pole layer does not submit an outage report.
- Retain required map/data attribution and check account entitlements, service costs, quotas, and allowed uses before deployment.
- Browser ArcGIS keys are visible to users: restrict their privileges and allowed referrers. Keep privileged credentials on the server and configure explicit demo/production origins.

References: [ArcGIS authentication](https://developers.arcgis.com/javascript/latest/authentication/access-tokens/), [API key restrictions](https://developers.arcgis.com/documentation/security-and-authentication/api-key-authentication/api-key-credentials/online/), and [licensing and attribution](https://developers.arcgis.com/javascript/latest/licensing/).

### Camera and location implementation

Start with a labeled file input:

```html
<label for="streetlight-photo">Take or choose a streetlight photo</label>
<input id="streetlight-photo" type="file" accept="image/*" capture="environment" />
```

`capture="environment"` requests the outward-facing camera on supporting devices; browser behavior varies, so retain an ordinary upload option. Add a preview, retake/remove actions, and a report-without-photo fallback if capture fails. The input's `accept` attribute is a picker hint, not file validation. See [MDN's capture guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/capture).

If a custom live preview is needed later, use `getUserMedia({ video: { facingMode: "environment" }, audio: false })`, handle permission/device errors, and stop camera tracks when finished. Live camera access requires a secure context and user permission. See [MediaDevices documentation](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).

Deploy over HTTPS and request GPS only when the user begins a report. Geolocation also requires permission and a secure context. Store location accuracy and capture time; offer map correction for denied, timed-out, or low-accuracy results. Do not rely on photo EXIF metadata for location. See [Geolocation API documentation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).

### Web app best practices

- **Fast first screen:** show the camera action immediately; load ArcGIS in a browser-only component when location review needs it. Display progress during upload and save, and preserve entered details after recoverable failures.
- **Small, validated uploads:** propose a 10 MB input limit and resize/compress supported images before upload. Validate actual file contents, size, and dimensions server-side; normalize orientation and remove unnecessary metadata. Test phone image formats and explain unsupported formats clearly.
- **Private photos:** store an object path in the report, not a permanent public image URL. Use private storage, ownership policies, and short-lived signed read URLs. [Supabase storage access control](https://supabase.com/docs/guides/storage/security/access-control) and [private downloads](https://supabase.com/docs/guides/storage/serving/downloads) document these controls.
- **Controlled writes:** use a scoped session, validate again on the server, enforce authorization and rate limits, and prevent clients from assigning themselves an admin role or setting a report to repaired. Never put privileged Supabase credentials in browser code.
- **Reliable submission:** upload through an authorized storage path, save report metadata after upload validation, and clean up abandoned uploads. Use an idempotency key so a retry cannot create the same report twice; distinguish this from warnings about other reports at the same pole.
- **Clear location confidence:** nearest-pole matching is a suggestion. Retain manual correction and handle no match, multiple nearby candidates, and unavailable geocoding without losing the report.
- **Accessible UI:** provide labels, keyboard access, readable contrast, large touch targets, and text alongside map status colors. The map must have a usable list/form alternative.
- **Test real phones:** verify capture/upload, retake, permissions, GPS fallback, slow connections, and retry behavior on iOS Safari and Android Chrome. Use Vitest for validation/matching logic and Playwright for the main browser flow.
- **Repeatable releases:** commit database migrations and the lockfile; run formatting, lint, TypeScript, relevant tests, and a production build in CI. Keep secrets in deployment settings and use sample data for preview deployments.

## Five-person team and feature ownership

The planning conversation assigns responsibilities to Person 1–5 without naming all team members. Add names/GitHub handles when the team confirms assignments. Each person owns an area, but changes still need another teammate's review.

### Person 1 — Project Lead / Product Owner / CenterPoint Research

- Define requirements, acceptance criteria, report fields, and the user journey.
- Document the existing reporting process and distinguish interview findings from confirmed provider requirements.
- Investigate permitted datasets, API availability, bulk reporting, and approved integration options.
- Coordinate issues, dependencies, shared interfaces, and pull request review.
- Prepare the demo narrative and final presentation.

Example branches: `docs/project-requirements`, `docs/centerpoint-process`, `docs/demo-presentation`.

**Handoff:** provide agreed requirements and data definitions to everyone; coordinate release review. Changes authored by the lead still need another reviewer.

### Person 2 — Streetlight Map and Pole Data

- Build the ArcGIS map as a browser-only React component and load the sample dataset.
- Associate pole IDs with coordinates and available address information.
- Implement pole selection and a pole-details view.
- Add a legend for working, reported, damaged, and unknown lights.
- Document dataset provenance and coordinate assumptions.

Example branches: `feature/streetlight-map`, `feature/pole-id-gps`, `feature/pole-details`, `feature/map-status-colors`.

**Handoff:** agree with Person 4 on pole lookup data and with Person 3 on how a selected pole populates the form.

### Person 3 — Frontend and Report Form

- Create the mobile-first Next.js home page and prominent “Take a photo” entry point.
- Build issue selection and the report form.
- Display the selected pole, coordinates, address, and uploaded photo.
- Implement review, validation feedback, submission, and confirmation screens.
- Present duplicate warnings, errors, and demo status clearly.

Example branches: `feature/home-page`, `feature/issue-selection`, `feature/report-form`, `feature/report-review`, `feature/confirmation-screen`.

**Handoff:** consume the agreed map selection, report API, and photo-upload interfaces from Persons 2, 4, and 5.

### Person 4 — Backend, GPS, and Report Processing

- Implement Next.js Route Handlers with shared Zod schemas, Supabase persistence, and authorization.
- Receive coordinates, suggest nearby poles, and resolve addresses.
- Generate report IDs and persist reports.
- Implement duplicate detection and report-status handling.
- Keep the demo provider adapter separate from any future approved integration.

Example branches: `feature/report-api`, `feature/gps-pole-matching`, `feature/address-lookup`, `feature/duplicate-detection`, `feature/report-status`.

**Handoff:** document request/response shapes, errors, and status values before the frontend depends on them.

### Person 5 — Photo Upload, QA, and Deployment

- Implement browser camera capture/upload, preview, validation, and private Supabase photo storage.
- Define basic image-quality feedback; advanced image analysis is later work.
- Use sample images and establish safe storage behavior.
- Test the full reporting flow and failure cases.
- Configure formatting, automated checks, GitHub Actions, and demo deployment.
- Write reproducible setup and deployment instructions once the stack exists.

Example branches: `feature/photo-upload`, `feature/photo-validation`, `test/end-to-end-report`, `ci/github-actions`, `docs/setup-instructions`.

**Handoff:** agree with Persons 3 and 4 on photo references and upload errors; coordinate release testing with the whole team.

## Shared data contract

Agree on one schema before implementing separate components. These are **illustrative mock records**, not real CenterPoint assets or reports.

Pole record:

```json
{
  "pole_id": "DEMO-104522",
  "latitude": 29.7604,
  "longitude": -95.3698,
  "address": "Houston, TX",
  "status": "unknown"
}
```

Report record:

```json
{
  "report_id": "DEMO-REPORT-0001",
  "pole_id": "DEMO-104522",
  "latitude": 29.7604,
  "longitude": -95.3698,
  "address": "Houston, TX",
  "issue_type": "light_out",
  "description": "Sample report for the hackathon demo.",
  "photo_path": "demo/sample-photo.jpg",
  "severity": "medium",
  "reported_at": "2026-09-25T20:00:00Z",
  "status": "submitted"
}
```

Proposed conventions:

- Issue types: `light_out`, `flickering`, `pole_damaged`, `pole_leaning`, `exposed_wires`, `other`.
- Report statuses: `draft` → `submitted` → `under_review` → `assigned` → `repaired`. These are internal/demo states, not a claim about a provider's actual work orders.
- Map condition and report workflow status are different fields on different records.
- Validate latitude/longitude ranges and use UTC timestamps. Add capture time and GPS accuracy to the implementation schema.
- `photo_path` is a private storage object reference; generate authorized temporary viewing URLs when needed.
- Allow unknown pole IDs and unavailable addresses/photos to be represented explicitly; finalize required versus optional fields together.
- Finalize severity rules and duplicate-matching thresholds before implementation.
- Contact information, if later collected, should be optional and excluded from public demo data.

## Step-by-step build plan

1. **Agree on the foundation.** Assign the five roles, confirm the recommended Next.js/ArcGIS/Supabase stack, define the data contract, and create scoped GitHub Issues with acceptance criteria.
2. **Set up collaboration.** Create `develop` from the initial `main`, configure branch protection and review requirements, then add formatting, tests, and CI as the codebase is scaffolded.
3. **Build the sample map.** Person 2 creates the mock pole dataset and selection flow while Person 4 implements the agreed lookup/report interfaces.
4. **Connect the form and photos.** Persons 3 and 5 integrate location, issue selection, photo preview, and review with those interfaces.
5. **Finish report processing.** Person 4 adds persistence, duplicate warnings, internal IDs, and demo statuses; Person 3 presents the results.
6. **Test the whole journey.** Test normal reporting, denied GPS permission, incorrect location, no nearby pole, duplicate reports, invalid images, missing fields, and save/API failures.
7. **Prepare the demo.** Person 1 explains research and limitations; Person 5 documents setup and deploys the tested demo. Demonstrate sample data and a clear official-provider handoff.
8. **Release tested work.** Open a `develop` → `main` pull request only after the combined application passes review and verification.

## GitHub workflow

Use short-lived branches for individual features, fixes, docs, or tests—not permanent branches for individual people.

```text
feature / fix / docs / test / ci branch
                  |
                  v
             develop
                  |
           integration testing
                  |
                  v
                main
```

- `main`: stable, reviewed demo releases.
- `develop`: shared integration branch.
- Work branches: one scoped issue or change, branched from `develop`.

The initial README bootstraps the empty repository. Subsequent implementation changes should follow the pull request workflow below. Branch protection, CI, and the `develop` branch are setup tasks; this README does not configure them.

### One-time team setup

Clone the repository:

```bash
git clone https://github.com/GhosteCobra/Houston_Streetlight_Reporting.git
cd Houston_Streetlight_Reporting
```

One designated maintainer creates the integration branch if it does not exist:

```bash
git switch main
git pull --ff-only origin main
git switch -c develop
git push -u origin develop
```

A repository administrator should protect `main` and `develop`, require pull requests and at least one teammate's approval, and require the project's CI checks once those checks exist.

### For every feature

1. Create or claim an issue describing the expected behavior and acceptance criteria.
2. Start from the latest `develop` and create a branch:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/pole-id-gps
```

3. Implement a small, reviewable change. Run the relevant tests and formatting checks.
4. Stage only intended files and commit:

```bash
git add <changed-files>
git commit -m "feat: connect pole IDs to GPS coordinates"
```

Replace `<changed-files>` with actual paths. Other useful commit prefixes are `fix:`, `test:`, `docs:`, and `ci:`.

5. Integrate the latest shared work while still on your feature branch:

```bash
git fetch origin
git merge origin/develop
```

If there are conflicts, resolve them with the relevant owners, stage the resolutions, complete the merge, and rerun affected checks.

6. Push your branch:

```bash
git push -u origin feature/pole-id-gps
```

7. Open a pull request **into `develop`**, link the issue, explain the behavior, and include test results.
8. Obtain another teammate's review, address feedback, and pass automated checks before merging.
9. Test the combined application on `develop`.
10. Open a separate **`develop` → `main`** release pull request when the demo is stable.

Branching reduces overlapping work; it does not eliminate conflicts. Discuss shared files and schema changes before editing them.

### Pull request checklist / definition of done

- [ ] The change meets the issue's acceptance criteria.
- [ ] Relevant automated tests or documented manual checks pass.
- [ ] Another teammate can reproduce the feature.
- [ ] The map, form, photo flow, and shared data contract still work together.
- [ ] Error cases are handled and merge conflicts are resolved.
- [ ] No secrets, private utility data, resident contact details, or real resident photos are committed.
- [ ] Setup and behavior changes are documented.
- [ ] Another teammate reviewed the change.
- [ ] Required CI checks pass once CI is configured.

### Working with coding agents

Give each agent a specific issue, branch, acceptance criteria, and file scope. Use a separate task worktree and branch for each agent, following [AGENTS.md](AGENTS.md). Share the agreed API/schema and coordinate edits to common files. Review agent-generated code and test it through the same pull request process as human-authored code.

## Daily team routine

At the start of each session, share what was completed, what is next, and what is blocked. Flag cross-team dependencies early and merge small reviewed changes regularly.

At the end of each session, run the combined application from a clean checkout once it exists, exercise the main reporting flow, record bugs as issues, and identify the next stable demo checkpoint.

## Repository framework

These folders now exist with Markdown guides. Entries described inside them as future code, fixtures, migrations, or CI are still pending.

```text
Houston_Streetlight_Reporting/
├── README.md
├── CONTRIBUTING.md
├── AGENTS.md
├── .agents/                    # Supplied skills and provenance
├── scripts/                    # Framework documentation checker
├── docs/
│   ├── README.md
│   ├── roles/                 # Five role guides and assignment directory
│   ├── requirements.md
│   ├── architecture.md
│   ├── data-contract.md
│   ├── api-contract.md
│   ├── backlog.md
│   ├── setup.md
│   ├── provider-research.md
│   ├── decisions.md
│   ├── deployment.md
│   └── demo.md
├── src/
│   ├── app/
│   │   ├── api/               # Person 4
│   │   └── report/            # Person 3, integrating Person 5's camera
│   ├── components/
│   │   ├── map/               # Person 2
│   │   ├── camera/            # Person 5
│   │   └── report/            # Person 3
│   └── lib/
│       ├── schemas/           # Shared contracts, coordinated by Person 4
│       ├── server/            # Person 4
│       └── arcgis/            # Person 2
├── supabase/
│   └── migrations/
├── data/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── .github/
    ├── OWNERSHIP.md
    ├── ISSUE_TEMPLATE/
    ├── pull_request_template.md
    └── workflows/             # CI plan only; no executable workflow yet
```

The recommended stack is Next.js/TypeScript, ArcGIS, Supabase, and Vercel, using npm. The repository now includes .gitignore and a documentation checker. Bootstrap work will add package files, a lockfile, placeholder .env.example, code, sample data, and application commands. Actual CODEOWNERS entries require confirmed GitHub handles; the ownership guide currently records roles. No packages, accounts, services, branch protection, or deployment are configured by this documentation scaffold.

## Data and provider integration

- Start with synthetic data or public data whose terms allow the intended use. Record provenance and licensing.
- Do not assume a visible provider map grants permission to extract or redistribute its dataset.
- Confirm the responsible owner for each service area rather than assuming every Houston/Galveston light belongs to CenterPoint.
- Keep provider submission behind an adapter such as `sendReportToProvider()`. In the demo, save locally or simulate the result and label it clearly.
- Do not automate live submissions or connect to internal provider systems without an approved method.
- Use sample photos for demonstrations. Keep credentials, `.env` files, private data, and resident information out of Git; commit only placeholder values in `.env.example`.
- Before any live deployment, agree on location/photo consent, access controls, retention, and deletion behavior.

Open research questions: Is an approved pole dataset available? What are its reuse terms? Is there an authorized API or bulk-reporting channel? How should other asset owners be handled? Can official receipt IDs and repair statuses be returned?

## Demo success criteria

A teammate can open the website on a phone, capture or choose a sample photo, confirm the suggested pole/location, choose an issue, review a duplicate warning when applicable, save the report, and view an internal confirmation/status. The presentation clearly explains what is simulated and what would require an approved provider integration.
