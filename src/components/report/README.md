# Report form UI

**Owner:** Person 3, with Person 5 for photo-to-location confirmation.

## Purpose

Issue selection, field errors, report summary, and status presentation.

## Implemented components

- `StreetlightApp.tsx` owns the photo, GPS/manual location, candidate lookup, selected pole, issue, review and browser-local draft save.
- `StreetlightSuggestion.tsx` presents a ranked candidate and emits confirmation or a request to use the existing candidate list. It does not query data or own report state.
- `Brand.tsx` renders the application branding.

Accepting a usable photo starts GPS. The controller calls the bounded CenterPoint `PoleDataAdapter.nearby` and `rankPoles` functions. Suggestions require resident confirmation; a photo's pixels do not establish its streetlight ID. See the [Person 5 handoff](../../../docs/photo-identification-handoff.md).

## Working rules

Use shared enums and schema errors. Keep photos private and distinguish internal status from official utility delivery.

Use the [team guides](../../../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../../../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.
