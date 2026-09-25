"""Check first-party Markdown and the unchanged, user-supplied skill bundle."""
from pathlib import Path
from urllib.parse import unquote
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def check():
    errors = []
    manifest = json.loads((ROOT / '.agents/source-manifest.json').read_text())
    imported = set()
    for record in manifest['files']:
        relative = Path(record['path'])
        path = ROOT / relative
        if relative.is_absolute() or '..' in relative.parts:
            errors.append(f'Unsafe manifest path: {relative}')
            continue
        imported.add(relative.as_posix())
        if not path.is_file():
            errors.append(f'Missing imported file: {relative}')
        elif hashlib.sha256(path.read_bytes()).hexdigest() != record['sha256']:
            errors.append(f'Imported file differs from archive: {relative}')
    bundled = {p.relative_to(ROOT).as_posix()
               for p in (ROOT / '.agents/skills').rglob('*') if p.is_file()}
    for extra in sorted(bundled - imported):
        errors.append(f'Unrecorded bundle file: {extra}')

    # Include untracked first-party docs, but not ignored worktrees/artifacts.
    paths = subprocess.check_output(
        ['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'],
        cwd=ROOT).decode().split('\0')
    documents = 0
    links = 0
    for name in sorted(set(paths)):
        if not name.endswith('.md') or name in imported:
            continue
        path = ROOT / name
        if not path.is_file():
            errors.append(f'Missing tracked document: {name}')
            continue
        documents += 1
        text = path.read_text()
        fence = None
        language = ''
        block = []
        outside = []
        for number, line in enumerate(text.splitlines(), 1):
            marker = re.match(r'^\s*(`{3,}|~{3,})(.*)$', line)
            if marker and fence is None:
                fence = marker[1]
                language = marker[2].strip()
                block = []
            elif (marker and fence and marker[1][0] == fence[0]
                  and len(marker[1]) >= len(fence) and not marker[2].strip()):
                if language == 'json':
                    try:
                        json.loads('\n'.join(block))
                    except ValueError as exc:
                        errors.append(f'{name}:{number}: invalid JSON: {exc}')
                fence = None
            elif fence:
                block.append(line)
            else:
                outside.append(line)
            if line.rstrip() != line:
                errors.append(f'{name}:{number}: trailing whitespace')
        if fence:
            errors.append(f'{name}: unclosed code fence')
        prose = '\n'.join(outside)
        for target in re.findall(r'\]\(([^)]+)\)', prose):
            target = target.strip().strip('<>')
            if re.match(r'^[a-zA-Z][\w+.-]*:', target) or target.startswith('#'):
                continue
            target = unquote(target.split('#', 1)[0])
            if not target:
                continue
            links += 1
            linked = (path.parent / target).resolve()
            if not linked.is_relative_to(ROOT) or not linked.exists():
                errors.append(f'{name}: missing/outside local target: {target}')
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    print(f'PASS: {documents} first-party Markdown files; {links} local links; '
          f'{len(imported)} imported file hashes; code fences and JSON examples.')
    print('External URLs, Markdown anchors, application runtime, and bundled helper behavior were not tested.')
    return 0


if __name__ == '__main__':
    raise SystemExit(check())
