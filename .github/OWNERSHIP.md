# Review ownership

Role assignments are placeholders, not GitHub permissions. Populate handles in the [team directory](../docs/roles/README.md), then create .github/CODEOWNERS with valid users/teams.

| Paths | Primary owner | Review partner |
| --- | --- | --- |
| docs/requirements.md, provider-research.md, backlog.md, demo.md | Person 1 | Affected role |
| src/components/map/, src/lib/arcgis/, data/ | Person 2 | Person 4 |
| src/app/ except api/, src/components/report/ | Person 3 | Person 5 |
| src/app/api/, src/lib/server/, supabase/ | Person 4 | Person 2; Person 5 for uploads |
| src/components/camera/, tests/, .github/workflows/ | Person 5 | Person 3; Person 4 for access policies |
| src/lib/schemas/, docs/data-contract.md, docs/api-contract.md | Person 4 | Persons 2, 3, and 5 as affected |
| package/lockfiles, root config, README, contributing | Coordinate all affected owners | Another teammate |

Keep the actual CODEOWNERS order specific enough that API ownership overrides general app ownership. Review routing does not replace tests or grant merge/admin privileges.
