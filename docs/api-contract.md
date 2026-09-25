# Proposed API contract

**Owner:** Person 4. No routes exist yet. Implement and test this contract before replacing frontend mocks. All endpoints are same-origin Next.js Route Handlers; verify the session server-side.

| Endpoint | Input | Result |
| --- | --- | --- |
| GET /api/poles | latitude, longitude, radius_m | `{poles: [...]}` normalized nearby poles |
| POST /api/location | latitude, longitude | `{address: string or null}`; lookup unavailable may return null |
| POST /api/uploads | filename, content_type, size_bytes | 201: `{upload_id, photo_path, upload_url, expires_at}` for session-scoped staging |
| POST /api/uploads/complete | upload_id | `{photo_path, validated: true}` after server content validation; rejected objects cannot attach to reports |
| POST /api/reports | Data-contract creation input; Idempotency-Key header | 201 for creation or 200 for identical retry: `{report_id, status, reported_at, provider_delivery_status}` |
| GET /api/reports/:id | Report ID | Authorized report plus temporary photo URL if present |

Proposed limits: 1 km maximum pole-query radius, at most 100 candidates per response, and 10 MB maximum photo input. Surface truncation so callers can narrow the query. Confirm these defaults during implementation and use the same limits in UI, API, and tests.

## Errors

Use `{error: {code, message, fields?}}`. Do not include tokens, storage credentials, stack traces, or private report details. Suggested HTTP statuses: 400 malformed input, 401 no valid session, 404 unavailable or unauthorized report, 409 changed payload for a reused idempotency key, 413 oversized upload, 415 unsupported format, 422 field/content validation, 429 rate limit, 503 dependency unavailable.

## Submission rules

1. Authenticate the session and validate the body against the shared schema.
2. Validate photo ownership and completed content checks if a photo is attached.
3. Scope the idempotency key to the session; use a unique database constraint and transactional handling for simultaneous retries. Same key plus different payload is a conflict.
4. Save the report and initial status event; return only after persistence succeeds.
5. Never call the utility in demo mode. Return `provider_delivery_status=not_sent`.

The browser uploads bytes to the authorized storage URL, then completes validation before creating a report. Do not route large binary uploads through the report JSON endpoint. Cleanup of failed/unclaimed uploads belongs to the server storage module.
