# Framework checks

Run `python3 scripts/check_framework.py` from the repository root with Python 3.9 or newer and Git available. It reads tracked and non-ignored untracked files, checks first-party Markdown local file links, code fences, JSON examples and trailing whitespace, and compares imported source bytes with .agents/source-manifest.json.

The source manifest records the user-supplied archive, not an independent authenticity guarantee. The check does not run imported helper scripts, follow external URLs, validate Markdown anchors, or test application behavior. Imported Markdown is preserved as supplied and excluded from first-party formatting/link checks.

Also run `git diff --check` and `git diff --cached --check`. Application checks must be added after the app is scaffolded.
