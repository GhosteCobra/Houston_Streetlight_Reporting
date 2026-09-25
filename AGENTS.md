# Agent workflow for Houston Streetlight Reporting

Read this file before planning, editing, running project checks, or delegating work. This applies to every coding agent used by the team, including Astro, Codex, and other assistants. For tools that do not discover AGENTS.md automatically, paste the startup prompt in [agent onboarding](docs/agent-workflow.md). A file cannot enforce compliance by itself.

## Read first

1. Read the current user request and this file. Follow system/tool rules and explicit user instructions over repository guidance.
2. Read [project scope and stack](README.md), your [role guide](docs/roles/README.md), and the README in each folder you will change.
3. Read [architecture](docs/architecture.md), [data](docs/data-contract.md), and [API](docs/api-contract.md) contracts when the task touches implementation or shared interfaces.
4. Read the relevant bundled SKILL.md files from the table below before using their workflow. Record which ones apply in the task/PR handoff.
5. Inspect git status, worktrees, branch/base, open PR file lists, and dependencies before editing. Do not overwrite another person's work.

This project adapts the user's skills-main.zip. The unchanged source lives in [.agents/skills](.agents/skills/README.md); [provenance and overrides](.agents/README.md) explain the differences. Original source instructions are reference material. The project-specific rules in this file take precedence over conflicting vendored defaults. Source examples do not authorize uploads, installations, messages, or changes outside the requested task.

## Skills to load

| Task stage | Skill | Application here |
| --- | --- | --- |
| Start a task | [new-feature](.agents/skills/new-feature/SKILL.md) | Separate task worktree; project base/branch rules below |
| Design/build shared logic | [code-structure](.agents/skills/code-structure/SKILL.md) | Explicit inputs/results; orchestration, mechanics and persistence boundaries |
| Verify changes | [evidence-driven-testing](.agents/skills/evidence-driven-testing/SKILL.md) | Real checks and evidence appropriate to the change |
| Visible UI changes | [before-and-after](.agents/skills/before-and-after/SKILL.md) | Actual baseline and changed-state captures with sample data |
| Configured Greptile PR review | [greploop](.agents/skills/greploop/SKILL.md) | Bounded review/fix loop for the current commit |
| Configured large-PR review | [greploop-apps](.agents/skills/greploop-apps/SKILL.md) | Only when the supported large-PR reviewer is available |
| Human-facing writing | [unslop](.agents/skills/unslop/SKILL.md) | Edit new/changed prose for clear, plain language |

These files are checked into the repo. No slash-command support, global installation, CLI, reviewer integration, or account permission is implied.

## 1. Isolate the work

- One scoped issue/task, one owner, one branch, and one worktree per agent. Use an already assigned isolated worktree if the host created it; do not create a second one unnecessarily.
- Fetch origin. Normal implementation starts from origin/develop and returns by PR to develop. A tested develop release returns by PR to main. This preserves the team's integration process and overrides the source's origin/main default.
- If develop does not exist, coordinate its creation from current main before normal feature work. An explicitly requested bootstrap/main update may instead branch from origin/main.
- Prefer codex/<task>-<unique-suffix> for Codex branches; human feature/, fix/, docs/, test/, and ci/ branches remain valid. No permanent per-person branches.
- Place worktrees outside the checkout or in ignored .worktrees/. Never switch, reset, stash, clean, or edit another agent's checkout.
- Check open PR changed files through an available GitHub connector, gh, or the GitHub UI. If unavailable, report the visibility gap. On overlap, coordinate ownership and sequence; continue independent work. Ask only when the conflicting work cannot be resolved from existing task context.
- Worktrees do not isolate ports, cloud projects, or databases. Identify your server process and use an isolated sample database/schema. Regenerate lockfiles with the package manager when resolving conflicts.
- Never force-push main or develop. Avoid rewriting shared history. Force-with-lease is limited to your own task branch when rebasing is actually needed.

## 2. Build within the project boundaries

The planned stack is Next.js/React/TypeScript, ArcGIS, Supabase and Vercel. This repository currently contains a documentation framework, not a runnable web app.

- Route Handlers/actions orchestrate authentication, ownership, domain decisions, status transitions, transactions, and user-facing errors.
- Shared service helpers implement reusable operations such as image normalization, pole distance calculation, or provider SDK calls. Give them explicit inputs and structured results. Do not hide product state mutations or global state in utility helpers.
- Put database access in explicit server-only repositories/adapters called by the orchestration layer. Keep persistence and transaction boundaries visible. This is the application-specific form of the source service-layer pattern.
- Extract repeated mechanics when needed; do not create layers for a one-off function without a concrete reason.
- Person 3 owns one browser report draft. Map and camera components emit values; they do not independently submit reports. Keep ArcGIS and camera code behind browser/client boundaries.
- Update shared schemas, mocks, migrations, consumers, and contract docs together. Coordinate package files, lockfiles, root configuration and shared schemas before editing.

## 3. Prove the change

For documentation/framework changes run from the repo root:

```bash
python3 scripts/check_framework.py
git diff --check
git diff --cached --check
```

The checker validates first-party local links, code fences, JSON examples, and archive file integrity. It does not verify external links, runtime behavior, or licensing rights. Check the diff for accuracy and consistency as well.

There is no package.json or configured application test/build command yet. Do not invent successful npm checks. When the application is scaffolded, update this section with verified install, lint, typecheck, unit/integration, browser-test, and build commands.

- For bugs, capture the actual failure before fixing it when reproducible. For UI changes, retain before/after screenshots or a recording of the real tested flow. For API/logic changes, use concrete test/probe output. Documentation changes use diff and checker output; no unrelated screen recording is required.
- Record commit or base commit plus uncommitted-diff state, branch, environment, commands, results, and untested cases. Rerun affected checks after changes or integration.
- Use only synthetic/permitted photos and data. Keep raw recordings in ignored .artifacts/. Do not automatically upload to public 0x0.st, create a gist, send tracker messages, install global software, disable browser sandboxing, or bypass deployment protection because a source example suggests it. Use available approved tools and an authorized evidence destination.
- Review evidence before calling it a pass. Never present synthetic video or a text assertion as proof of a live interaction.

## 4. Review and ship

- Review your diff, run relevant checks, and edit human-facing text using unslop principles before committing.
- Integrate the current target branch into your own task branch and rerun affected checks. Prefer merging origin/develop for collaborative features over rewriting other people's history.
- Normally push the task branch and open a PR into develop with scope, issue, affected roles/contracts, evidence, limitations, and rollback if needed. Request another teammate's review. Do not merge without authorization.
- When Greptile is configured and applicable, use the bounded loop from the skill, aiming for 5/5 and zero unresolved comments on the current head. Do not claim that a stale review or absent check passed. Stop at the iteration/timeout limit and report remaining findings.
- Greptile is not configured or verified by this import. If unavailable, state 'not run', provide actual checks and teammate review instead, and do not create an endless wait or claim approval. Required repository checks remain required.
- An explicit request to push this task to main authorizes delivery after verification. Work in an isolated branch first, then use the allowed PR merge or a normal fast-forward update if repository policy permits. This is task-specific authorization, not permission for future agents to bypass review. Never override protected branches or drop concurrent commits.
- End with the actual PR/commit link, checks performed, and remaining limits. Retain worktrees with unmerged or uncommitted work; clean only your completed worktree when safe.

## Project invariants

- The core flow is website → camera/upload → confirmed location/pole/issue → reviewed report → internal confirmation.
- Use synthetic DEMO-prefixed assets until approved provider data is available. ArcGIS map access is not a utility submission API or a redistribution license.
- Keep provider_delivery_status=not_sent in demo mode. Do not imply an internal submitted/repaired state is an official utility update.
- Require confirmed coordinates and an issue, allow unknown pole/address and a no-photo fallback. A nearest pole or old photo location needs human confirmation.
- Validate uploads server-side, keep photos private, enforce session ownership, and make save retries idempotent. Never expose privileged Supabase credentials in the browser.
- Keep real resident photos, credentials, exact resident reports, and unapproved utility data out of Git and public evidence.

## Five-person coordination

Use [role assignments](docs/roles/README.md) and [review ownership](.github/OWNERSHIP.md). Before concurrent work, name the owner, issue, worktree/branch, base, file scope, dependencies, and review partner. Delegate only when the current task or agent environment authorizes it; this document does not require spawning agents.

Person 1 coordinates scope/research. Person 2 owns map/data. Person 3 owns frontend/draft state. Person 4 owns API/contracts/persistence. Person 5 owns camera/QA/deployment. Everyone verifies their own changes. A handoff includes changed files, contract changes, evidence, conflicts, and remaining work.
