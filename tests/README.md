# Test strategy and acceptance matrix

**Coordinator:** Person 5. Each role owns its feature tests. No application tests or runners exist yet. The documentation checker is available as `python3 scripts/check_framework.py`.

Use Vitest for schema, matching, and idempotency logic; integration tests for database/storage access; Playwright for browser reporting flow. Real-device camera testing complements simulated browser input.

| Scenario | Expected result | Owner |
| --- | --- | --- |
| Valid synthetic report | Saved once, internal ID returned, provider not_sent | 3 + 4 |
| GPS denied/times out | Manual location remains usable | 2 + 3 |
| Old uploaded photo | User confirms location separately | 3 + 5 |
| No/ambiguous nearby pole | Manual correction or null pole allowed | 2 + 4 |
| Map/geocoder unavailable | Coordinates/form remain usable | 2 + 3 |
| Same-key concurrent retry | One report; repeat returns same ID | 4 |
| Same key, changed payload | Conflict without overwriting original | 4 |
| Large, spoofed, corrupt image | Rejected before attachment to report | 4 + 5 |
| Camera denial or unsupported format | Upload/no-photo recovery | 3 + 5 |
| Slow upload/save failure | Draft preserved; no false success | 3 + 5 |
| Two independent sessions | No cross-session report/photo access | 4 + 5 |
| Client attempts repaired status | Rejected; server sets initial status | 4 |
| Keyboard and non-map flow | Report possible without marker clicks | 2 + 3 |
| iOS Safari / Android Chrome | Capture, preview, retake, GPS and save work | 5 |

## Evidence template

Date, commit, tester, device/browser, fixture, steps, expected result, actual result, pass/fail, and issue link. Mark unrun scenarios as not tested. Use synthetic photos/coordinates only.

Place focused logic tests in unit/, service/policy tests in integration/, and browser flow tests in e2e/. Never test against real resident reports or send live utility submissions.

## Agent evidence

Follow [AGENTS.md](../AGENTS.md) and load the evidence-driven-testing skill for verification. Capture a real before state for reproducible bugs, then verify the changed behavior. Record exact revision/environment and untested cases. Docs use checker output and diff; UI uses actual captures. Store raw evidence in ignored .artifacts/ and share only to an authorized destination.
