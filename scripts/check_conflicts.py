"""Reject unresolved merge markers in repository files, including pending additions."""
from pathlib import Path
import re, subprocess

ROOT = Path(__file__).resolve().parents[1]
MARKER = re.compile(r'^(?:<<<<<<<(?: |$)|>>>>>>>(?: |$)|\|{7}(?: |$)|={7}$)', re.MULTILINE)

def marker_lines(text):
    return [text.count('\n', 0, match.start()) + 1 for match in MARKER.finditer(text)]

def inspect(root=ROOT):
    names = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).split(b'\0')
    failures = []
    for name in sorted(set(filter(None, names))):
        path = root / name.decode('utf8')
        if not path.is_file(): continue
        try: text = path.read_text(encoding='utf-8-sig')
        except UnicodeDecodeError: continue
        failures.extend(f'{name.decode("utf8")}:{line}: unresolved merge marker' for line in marker_lines(text))
    return failures

if __name__ == '__main__':
    errors = inspect()
    for error in errors: print('FAIL', error)
    print(f'{"FAIL" if errors else "PASS"}: repository merge markers')
    raise SystemExit(bool(errors))
