# Houston Streetlight Reporting

A GPS- and photo-assisted hackathon project to help residents report streetlight problems in Houston, Galveston, and the surrounding area safely and accurately.

**Status: planning and documentation.** This repository currently contains the project README. The application, sample dataset, tests, CI, and deployment described below are planned work; there is no runnable application yet.

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

1. **Start a report safely.** A passenger can report, or a driver can wait until safely parked. Never require someone to approach damaged equipment to read a pole number.
2. **Choose a location.** Request GPS permission and provide a manual map/location option when permission is denied or coordinates are inaccurate.
3. **Identify the pole.** Show nearby sample streetlights, suggest the nearest pole, and let the user confirm or correct the selection.
4. **Describe the issue.** Select light out, flickering, damaged pole, leaning pole, exposed wires, or other; add an optional description and photo.
5. **Check the report.** Show the pole ID, coordinates, nearby address, issue, photo, and any possible duplicate.
6. **Review and save.** Validate the report and generate an internal confirmation ID.
7. **Explain the next step.** Show demo status and a prepared summary/link for the official reporting process. Only an approved future integration may claim successful delivery to a utility.

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

- Build the interactive streetlight map and load the sample dataset.
- Associate pole IDs with coordinates and available address information.
- Implement pole selection and a pole-details view.
- Add a legend for working, reported, damaged, and unknown lights.
- Document dataset provenance and coordinate assumptions.

Example branches: `feature/streetlight-map`, `feature/pole-id-gps`, `feature/pole-details`, `feature/map-status-colors`.

**Handoff:** agree with Person 4 on pole lookup data and with Person 3 on how a selected pole populates the form.

### Person 3 — Frontend and Report Form

- Create the home page and “Report a Streetlight” entry point.
- Build issue selection and the report form.
- Display the selected pole, coordinates, address, and uploaded photo.
- Implement review, validation feedback, submission, and confirmation screens.
- Present duplicate warnings, errors, and demo status clearly.

Example branches: `feature/home-page`, `feature/issue-selection`, `feature/report-form`, `feature/report-review`, `feature/confirmation-screen`.

**Handoff:** consume the agreed map selection, report API, and photo-upload interfaces from Persons 2, 4, and 5.

### Person 4 — Backend, GPS, and Report Processing

- Define the report API and validate required fields.
- Receive coordinates, suggest nearby poles, and resolve addresses.
- Generate report IDs and persist reports.
- Implement duplicate detection and report-status handling.
- Keep the demo provider adapter separate from any future approved integration.

Example branches: `feature/report-api`, `feature/gps-pole-matching`, `feature/address-lookup`, `feature/duplicate-detection`, `feature/report-status`.

**Handoff:** document request/response shapes, errors, and status values before the frontend depends on them.

### Person 5 — Photo Upload, QA, and Deployment

- Implement photo selection/upload, preview, file-type checks, and size limits.
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
  "photo_url": "sample-photo.jpg",
  "severity": "medium",
  "reported_at": "2026-09-25T20:00:00Z",
  "status": "submitted"
}
```

Proposed conventions:

- Issue types: `light_out`, `flickering`, `pole_damaged`, `pole_leaning`, `exposed_wires`, `other`.
- Report statuses: `draft` → `submitted` → `under_review` → `assigned` → `repaired`. These are internal/demo states, not a claim about a provider's actual work orders.
- Map condition and report workflow status are different fields on different records.
- Validate latitude/longitude ranges and use UTC timestamps.
- Allow unknown pole IDs and unavailable addresses/photos to be represented explicitly; finalize required versus optional fields together.
- Finalize severity rules and duplicate-matching thresholds before implementation.
- Contact information, if later collected, should be optional and excluded from public demo data.

## Step-by-step build plan

1. **Agree on the foundation.** Assign the five roles, choose the frontend/backend/map/storage stack, define the data contract, and create scoped GitHub Issues with acceptance criteria.
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

Give each agent a specific issue, branch, acceptance criteria, and file scope. Use separate checkouts/worktrees when agents work concurrently. Share the agreed API/schema and coordinate edits to common files. Review agent-generated code and test it through the same pull request process as human-authored code.

## Daily team routine

At the start of each session, share what was completed, what is next, and what is blocked. Flag cross-team dependencies early and merge small reviewed changes regularly.

At the end of each session, run the combined application from a clean checkout once it exists, exercise the main reporting flow, record bugs as issues, and identify the next stable demo checkpoint.

## Proposed repository layout

Only this README exists at bootstrap. Create the following structure as implementation begins:

```text
Houston_Streetlight_Reporting/
├── frontend/
├── backend/
├── data/
│   └── streetlights.sample.json
├── tests/
├── docs/
├── .github/
│   └── workflows/
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── CODEOWNERS
└── README.md
```

The stack, package manager, environment variables, test commands, and hosting provider remain to be selected. Add verified install/run/test instructions when the initial application is committed.

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

A teammate can select a sample pole, confirm its location, attach a sample photo, choose an issue, review a duplicate warning when applicable, save the report, and view an internal confirmation/status. The presentation clearly explains what is simulated and what would require an approved provider integration.
