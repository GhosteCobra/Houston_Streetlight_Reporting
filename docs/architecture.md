# Architecture and module boundaries

**State:** proposed implementation. Stack details and official references are in the [README](../README.md#recommended-tech-stack).

## Request flow

```text
Phone browser: capture + GPS/manual location + review
    → Next.js Route Handlers: authentication, validation, authorization
    → Supabase PostgreSQL: reports, poles, status events
    → Supabase private Storage: validated photos

Browser-only ArcGIS map ← synthetic/approved pole adapter
Server location logic → optional configured address lookup
Provider adapter → demo result only until approved integration exists
```

Person 3 owns one report draft in the page/controller. Camera and map components emit values; they do not submit reports themselves. Keep privileged database/storage/provider logic server-only. Share Zod schemas and inferred types without importing server credentials into browser bundles.

## Proposed component boundaries

- `CameraCapture`: receives the current photo selection; emits a selected File or null and recoverable errors. It manages preview cleanup, not report persistence.
- `StreetlightMap`: receives normalized poles, selected pole ID, and location; emits pole selection and corrected coordinates. Include a list alternative.
- `ReportForm`: owns issue, description, location confirmation, photo selection, review state, and duplicate warning acknowledgement.
- `ReportService`: validates, authorizes, and persists one submission using the API contract.
- `PoleDataSource`: returns normalized poles from synthetic fixtures first and an authorized ArcGIS service later.
- `ProviderAdapter`: prepares a handoff summary; returns `not_sent` in demo mode. Never silently fall back to a live provider.

## Agent implementation boundaries

Apply the bundled code-structure skill under [AGENTS.md](../AGENTS.md). Route Handlers/actions own authentication, domain decisions and transaction orchestration. Server-only repositories/adapters perform explicit database access; reusable service helpers receive inputs and return structured results without hidden product-state changes. Extract repeated mechanics only when they have real callers. This refines the ReportService label above rather than adding a separate backend application.

## State and failure handling

Suggested UI states: capture → locating → review → uploading → saving → confirmed, with retryable errors returning to the draft. Geocoding failure must not prevent manually confirmed coordinates. A report save must reference only a validated upload belonging to the current session. Track abandoned uploads for cleanup. Persist idempotency results transactionally with report creation.

Store map condition separately from report workflow status. Status changes and their actor/time belong in history. An internal `submitted` report is not a utility receipt.
