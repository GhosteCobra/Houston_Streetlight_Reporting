# Expo companion

The main web application is Next.js at the repository root. This workspace is the requested React Native companion, using Expo SDK 57, Expo Router and shared TypeScript report validation.

Run `npm ci` at the root, then `npm run mobile`. Run `npm run export --workspace mobile` to build Android, iOS and web bundles. See [Person 3 handoff](../docs/person3-handoff.md) for behavior, integration points, and limitations.

Native photos, GPS and an interactive map are not connected yet. The working photo-free flow uses manual coordinates or a synthetic pole, review, duplicate acknowledgement, and device-local persistence. It never sends a report to a utility.
