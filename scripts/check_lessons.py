"""Run independent lesson examples and compare stdout; does not award learner progress."""
from pathlib import Path
import json, shutil, subprocess, sys, tempfile
ROOT=Path(__file__).resolve().parents[1]
lessons=json.loads((ROOT/'learning/courses.json').read_text(encoding='utf8'))['lessons']
java=shutil.which('java')
if not java: raise SystemExit('Install JDK 17+ to verify lesson examples')
with tempfile.TemporaryDirectory(prefix='roadmap-lessons-') as out:
    files=[str(ROOT/l['example']) for l in lessons if l['language']=='java']
    compiler=[shutil.which('javac')] if shutil.which('javac') else [java,'-m','jdk.compiler/com.sun.tools.javac.Main']
    subprocess.run(compiler+['--release','17','-encoding','UTF-8','-d',out]+files,check=True,timeout=60)
    for lesson in lessons:
        command=[java,'-Dfile.encoding=UTF-8','-cp',out,lesson['id']] if lesson['language']=='java' else [sys.executable,str(ROOT/lesson['example'])]
        result=subprocess.run(command,capture_output=True,text=True,encoding='utf8',check=True,timeout=15)
        if result.stdout.strip()!=lesson['expected'].strip():
            raise SystemExit(f"FAIL {lesson['id']}: expected={lesson['expected']!r} actual={result.stdout!r}")
        print('PASS',lesson['id'])
