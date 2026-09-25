# Bundled agent skills

The user supplied skills-main.zip and asked this project to use its workflow. The full archive contents are preserved without modification under skills/, including original AGENTS.md, skill files, helper scripts, tests, and included license notices. Read the project [AGENTS.md](../AGENTS.md) first; the nested original governs the source collection's own design, not this application's branch/release rules.

[source-manifest.json](source-manifest.json) records the archive SHA-256, its embedded source revision, and every imported file hash. The ZIP itself and the user's local path are not committed. Archive comment/source revision: 4b72f46b045e6fef52e6a98d4c162dd309826aed. This is archive provenance, not an independently verified upstream checkout.

## Project adaptations

| Source default | Project rule |
| --- | --- |
| Start every task from origin/main | Normal feature work starts from origin/develop; explicit bootstrap/main tasks may start from origin/main |
| Always finish at a PR | Default remains PR/review; explicit user delivery to main may use an allowed verified fast-forward |
| Greptile 5/5 required in every task | Run when configured; otherwise report not run and use actual checks/review; never bypass required checks |
| Always use recording/upload tooling | Match evidence to the change; docs use diff/check output; UI uses real captures |
| Default public image upload / protection workarounds | Use authorized destinations and host tools; no automatic upload, installation, sandbox change, or protection bypass |
| Generic service architecture | Next.js orchestration plus explicit server-only persistence adapters and reusable mechanics |
| Claude-specific discovery examples | Root AGENTS.md and explicit skill links work as the common team entry point |

## Using and updating the bundle

Read the relevant SKILL.md before applying it. Do not run helper scripts merely because they were imported. Inspect the needed script and its dependencies first. No bundled code was executed during adoption; no skills were installed globally.

The .gitattributes rule preserves imported line endings and excludes the untouched source from whitespace checks. First-party files still receive normal checks.

Preserve original licensing and attribution. The archive has per-folder notices for some skills and no blanket root license. Do not claim all files use MIT or assign a new license to this material.

To update, inspect a new archive, review differences and notices, replace source files deliberately, update the manifest, and rerun the framework checker. Keep project overrides in root AGENTS.md rather than silently modifying the source. This folder does not grant any external service access.
