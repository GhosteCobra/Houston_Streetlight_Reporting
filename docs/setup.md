# Setup and bootstrap plan

**Owners:** Persons 3 and 5; Person 4 owns database setup. The repository currently has documentation only: no package.json, installed dependencies, executable scripts, or running app.

## Bootstrap checklist

- [ ] Choose a supported Node.js LTS release and record the exact version.
- [ ] Scaffold Next.js App Router with TypeScript under the existing src/ structure, preserving these guides.
- [ ] Use npm and commit package-lock.json; pin compatible stable dependencies.
- [ ] Add Tailwind, ArcGIS, Zod, Supabase clients, and the testing tools from the project README as needed.
- [ ] Define and verify dev, build, lint, typecheck, test, and test:e2e package scripts.
- [ ] Provide .env.example containing names and placeholders only; ignore local .env files except this example.
- [ ] Create a sample-data-only Supabase project, apply reviewed migrations/policies, and configure private photo storage.
- [ ] Configure restricted ArcGIS browser credentials and synthetic data mode.
- [ ] Verify a clean checkout on a second computer and replace this checklist with tested commands.

## Configuration inventory to finalize

| Setting | Visibility | Purpose |
| --- | --- | --- |
| ArcGIS browser key | Public, privilege/referrer restricted | Allowed map/location services |
| Supabase URL and publishable key | Public with enforced policies | Session-aware client access |
| Privileged Supabase credential, if needed | Server only | Narrow administrative operations |
| Provider mode | Server-controlled | Default demo; no live submission |
| Allowed application origins | Server/deployment configuration | Preview and deployment boundaries |
| Upload size/type limits | Shared validated configuration | Consistent browser/server behavior |

Exact variable names are not established yet. Never prefix a privileged secret with NEXT_PUBLIC_. Anonymous session support must be configured and tested before reports are exposed to public traffic.

After scaffolding, document exact install/start/check commands, required services, migration/seed steps, expected localhost URL, and troubleshooting for camera HTTPS, denied GPS, invalid credentials, and unavailable services. Refer to official stack links in the project README when selecting current package versions.
