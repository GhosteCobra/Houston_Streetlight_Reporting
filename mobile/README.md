# Expo companion prototype

Preserved from the web-and-native-prototype branch. The supported desktop and mobile browser experience is the Next.js app at the repository root. This separate Expo prototype uses synthetic poles and does not yet include native camera, GPS, or the live map.

Install root dependencies with `npm ci`, then run `npm ci --prefix mobile`. Start with `npm start --prefix mobile`; check types with `npm run typecheck --prefix mobile`. It uses Expo SDK 57 and the prototype contract in [shared](../shared/README.md).

Its manual-location, review and local-save flow does not send reports to a utility or sync with browser drafts. The [original handoff](../docs/person3-handoff.md) describes the historical prototype, not the current web app.
