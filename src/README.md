# Application source

**Owner:** Person 3 coordinates; all roles contribute. **Status:** documentation placeholder; implementation pending.

## Purpose

Next.js App Router application, reusable components, shared contracts, and server-only services.

## Planned contents

app/ for pages and routes; components/ for map/camera/report UI; lib/ for contracts and adapters.

## Working rules

Keep one app and one dependency lockfile. Do not scaffold separate competing frontend/backend applications.

Use the [team guides](../docs/README.md) for dependencies, acceptance criteria, and workflow, and the [shared contract](../docs/data-contract.md) for field definitions. Update this folder guide with actual entry points and verified commands as code is added.

## Person 3 implementation

Implemented: Next.js App Router in app/, shared report UI in components/report/, and the browser demo store in lib/demo-store.ts. The requested Expo companion lives in mobile/ at the root and shares report types. Run npm run dev; see docs/person3-handoff.md.

