# Test the website on your phone with Vercel

## Current status

Deployment bootstrap branch: `codex/vercel-phone-preview-0926`, based on `origin/main` at `0aefce6`. There was no `develop` branch at task start. This branch adds hosting configuration and this guide, without merging to main or changing the other agent's checkout.

The base contains no runnable Next.js app or package lockfile. The camera task owns application bootstrap on `codex/camera-first-0926`. A working application commit must be integrated and tested before Vercel can build this branch. No live URL or phone-test pass is claimed by this setup.

## What the account owner does

1. Sign in to [Vercel](https://vercel.com/dashboard) with the account that should own the preview. If creating an account, complete the account and terms steps yourself.
2. Once the application commit is ready, import `GhosteCobra/Houston_Streetlight_Reporting` through **Add New → Project**, or use its existing Vercel project. If Vercel cannot see the repository, grant its GitHub integration access to this repository.
3. Use the repository root as Root Directory and **Next.js** as the framework. The root `vercel.json` uses `npm ci` and `npm run build`; these require the app's committed `package.json` and `package-lock.json`. Leave Output Directory at the framework default. Use the Node major specified by the application scaffold.
4. Keep the Production branch set to `main`. Deploy `codex/vercel-phone-preview-0926` as a **Preview**, using the project's deployment creation action to select that branch after import, or by pushing a new commit on that branch once Git is connected. Do not change production branch tracking just to test a phone. Importing documentation-only main may fail its initial build; the runnable preview branch is the one to deploy.
5. Add only environment variables required by the integrated app to the **Preview** environment. A browser-only camera demo may need none. If the app uses Supabase, use a separate sample project and the names in [setup](setup.md): `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never use a secret/service-role key in a public variable. Redeploy after changing environment variables. Do not add made-up provider-mode variables; verify the implementation actually keeps provider delivery `not_sent`.
6. Wait for **Ready**, then copy the actual HTTPS deployment URL. Open it in Safari on iPhone or Chrome on Android. Your phone can use cellular data or any Wi-Fi; your computer does not need to stay running.
7. Use the deployment's **Share** control to give teammates access. If a teammate sees a Vercel login or access-request page, grant preview access through Vercel's sharing flow. Keep deployment protection enabled. Do not post protected share links containing access tokens in Git or public evidence.

Vercel describes [Git branch previews](https://vercel.com/docs/git), [Next.js hosting](https://vercel.com/docs/frameworks/full-stack/nextjs), and [sharing deployments](https://vercel.com/docs/deployments/sharing-deployments). A pushed Git branch alone does not connect a Vercel account or deploy a working site.

## What the coding agent does

- Keep this work in its isolated worktree, `/Users/aryanbaki/Documents/ChatGPT/Streetlight-vercel-0926`, and coordinate application-file ownership with the camera task.
- Integrate the agreed runnable camera commit into this branch after its owner finishes it. Review the diff and resolve configuration conflicts without replacing the other task's code.
- Install dependencies using the app's selected Node runtime and run its actual configured checks plus a production build. Record commands and results; do not label unimplemented scripts as passing.
- Connect the selected Vercel project after account access is available, deploy a Preview, and verify its URL and deployed commit.
- Check the actual HTTPS page and its camera/location fallback behavior. Record real-phone results separately from desktop browser results.

## Phone checks for each teammate

Use a synthetic test image and avoid capturing people or private information. Open the URL directly in the browser, rather than inside a messaging app's embedded browser.

| Check | Expected behavior | Result |
| --- | --- | --- |
| Open the HTTPS link on cellular data | Website loads without relying on the developer's laptop | Not run |
| Camera or photo picker | Supported capture/selection works and produces a preview | Not run |
| Cancel, retake, remove | Draft recovers without a broken screen | Not run |
| No-photo path | Reporting flow can continue when implemented | Not run |
| Allow location | GPS result is shown for confirmation when implemented | Not run |
| Deny location | Manual fallback is available when implemented | Not run |
| Refresh and reopen | Expected page loads; draft retention matches documented behavior | Not run |
| Second teammate opens the link | Access works using the project's sharing policy | Not run |
| Demo confirmation | Clearly labeled internal/demo result; no utility delivery claim | Not run |

Record the exact deployment URL, commit, phone model, OS/browser version, and pass/fail details. A working camera picker does not verify backend persistence, photo privacy, or utility delivery. Test those separately once implemented.

## Troubleshooting and rollback

- **Build cannot find package.json:** the chosen branch or Root Directory does not contain the runnable app. Check the deployed branch and commit.
- **npm ci fails:** ensure the package manifest and lockfile belong to the same application commit. Regenerate the lockfile with the agreed package manager if dependencies changed.
- **Camera/GPS unavailable:** use the real HTTPS URL, open it in the phone's main browser, and check that browser's site permissions. `localhost` on a phone refers to the phone, and an HTTP laptop IP does not provide the secure context required for live camera/GPS APIs.
- **Old version appears:** compare the deployment commit to the branch head and reload the exact new deployment URL.
- **Preview fails:** share the last verified deployment URL while fixing the branch. Do not promote a failing preview to production or reset main. This configuration makes no database changes.

## Setup handoff

Owner: this task, Person 5 deployment scope. Review partner: Person 3 for app compatibility; Person 4 if storage or credentials are added. Dependencies: camera application bootstrap, Vercel account access, GitHub integration access. No shared data/API contract changes.

Skills applied: new-feature, evidence-driven-testing, unslop, with repository overrides. Documentation/configuration checks are recorded in the task handoff. Hosted build, real-phone testing, backend isolation, and Greptile review remain not run until evidence is recorded.
