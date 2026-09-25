# Product requirements

**Owner:** Person 1. **State:** proposed MVP baseline; no features implemented.

## Goal and audience

Help residents in the Houston/Galveston area prepare accurate streetlight reports from a phone browser. The demo uses synthetic assets and internal report status. Camera capture is the main entry point, with upload and manual location alternatives.

## Required journey

1. Open the website and choose to capture/select a photo.
2. Request GPS at the point of use, or choose a location manually.
3. Suggest nearby poles; let the resident confirm or correct the location.
4. Select an issue, inspect any duplicate warning, and review the draft.
5. Save once, receive an internal ID, and view the report’s demo status.
6. Offer a summary and official-provider link without claiming utility receipt.

## Acceptance boundaries

- Photo is optional if capture is unavailable; confirmed coordinates and issue type are required.
- Unknown pole and address are allowed. Never silently pick a distant pole.
- A possible duplicate is a warning, not proof that a report should be discarded.
- No automatic photo diagnosis, OCR, live utility submission, or official repair-status synchronization is required for MVP.
- GPS permission denial, unavailable map/address service, upload failure, and save failure have recovery paths.
- The resident can review before any submission. Do not ask a driver to interact while driving or approach damaged equipment.
- Anonymous sessions are the proposed access model; losing the session may lose report access. Do not promise cross-device recovery until implemented.

## Release evidence

A second teammate completes the [test matrix](../tests/README.md), and the demo uses no private resident data. Record issues, test results, browser/device, and limitations before release.
