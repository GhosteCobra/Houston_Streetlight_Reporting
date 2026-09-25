# Setup and bootstrap plan

**Owners:** Persons 3 and 5; Person 4 owns database setup. The repository currently has documentation only: no package.json, installed dependencies, application scripts, or running app. The framework checker and root .env.example are available.

## Bootstrap checklist

- [ ] Choose a supported Node.js LTS release and record the exact version.
- [ ] Scaffold Next.js App Router with TypeScript under the existing src/ structure, preserving these guides.
- [ ] Use npm and commit package-lock.json; pin compatible stable dependencies.
- [ ] Add Tailwind, ArcGIS, Zod, Supabase clients, and the testing tools from the project README as needed.
- [ ] Define and verify dev, build, lint, typecheck, test, and test:e2e package scripts.
- [x] Provide root .env.example with Supabase placeholders; ignore local .env files except this example.
- [ ] Create a sample-data-only Supabase project, apply reviewed migrations/policies, and configure private photo storage.
- [ ] Configure restricted ArcGIS browser credentials and synthetic data mode.
- [ ] Verify a clean checkout on a second computer and replace this checklist with tested commands.

## Supabase environment file

The [`.env.example`](../.env.example) file sits in the project root, beside README.md and AGENTS.md, outside src/. On first setup, copy it to .env.local from the root. This command preserves any existing local configuration:

```bash
cp -n .env.example .env.local
```

Edit .env.local and set `NEXT_PUBLIC_SUPABASE_URL` to your project's URL and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to its publishable key. Get both from the Supabase project's Connect panel. These names follow the [official Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs).

The example also includes a commented `NEXT_PUBLIC_SUPABASE_ANON_KEY` for legacy client code. Use the name the client actually reads; adding that variable alone does not create a fallback. Prefer the publishable-key name for new implementation. Never use a secret or service_role key in either public variable.

Only the placeholder example belongs in Git. `.gitignore` already excludes .env.local. Each teammate maintains their own local values, and deployed environments need their own hosting configuration. After the app exists, restart its development server after changing environment values. This file prepares configuration; the Supabase client, access policies, and connection still need implementation.

## Configuration inventory to finalize

| Setting | Visibility | Purpose |
| --- | --- | --- |
| ArcGIS browser key | Public, privilege/referrer restricted | Allowed map/location services |
| Supabase URL and publishable key | Public with enforced policies | Session-aware client access |
| Privileged Supabase credential, if needed | Server only | Narrow administrative operations |
| Provider mode | Server-controlled | Default demo; no live submission |
| Allowed application origins | Server/deployment configuration | Preview and deployment boundaries |
| Upload size/type limits | Shared validated configuration | Consistent browser/server behavior |

Supabase public variable names are defined above; names for the remaining settings are still to be finalized. Never prefix a privileged secret with NEXT_PUBLIC_. Anonymous session support must be configured and tested before reports are exposed to public traffic.

After scaffolding, document exact install/start/check commands, required services, migration/seed steps, expected localhost URL, and troubleshooting for camera HTTPS, denied GPS, invalid credentials, and unavailable services. Refer to official stack links in the project README when selecting current package versions.
