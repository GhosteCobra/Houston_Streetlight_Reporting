# Deployment and release plan

**Owner:** Person 5 with Persons 1 and 4. Hosting recommendation: Vercel web/API plus Supabase database/private storage. No deployment exists yet.

## Before the first preview

- [ ] Bootstrap/build locally and commit the lockfile.
- [ ] Create a separate sample-only environment; configure migrations, access policies, and anonymous sessions.
- [ ] Add credentials in hosting settings, restrict ArcGIS keys to intended origins, and confirm service quotas.
- [ ] Configure private upload validation/cleanup and enforce server authorization.
- [ ] Deploy over HTTPS and record the URL and commit in the release PR.
- [ ] Verify that provider mode cannot send live reports and all demo status is labeled.

## Release gate

Run formatting, lint, type checks, applicable tests, and production build. Then complete the [test matrix](../tests/README.md), including real-phone capture and cross-session isolation. Merge feature PRs into develop; promote tested develop into main with review. Configure host branch behavior explicitly so integration branches cannot accidentally update a live environment.

## Rollback

Record the previous working deployment and commit. Revert to it if the main reporting path fails. Review database compatibility before application rollback; do not drop tables or erase reports to recover. Favor additive migrations and document any migration recovery steps in their PR.

## Handoff record

Release commit, preview/demo URL, deployment owner, configuration names (no values), migration version, test evidence, known limitations, prior deployment, and rollback steps. Keep logs free of images, coordinates, access tokens, and resident contact details.
