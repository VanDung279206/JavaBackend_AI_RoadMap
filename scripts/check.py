"""Compile exactly one source tree and its shared contract tests (JDK 17+, Python 3)."""
from pathlib import Path
import argparse, shutil, subprocess, tempfile
p=argparse.ArgumentParser()
p.add_argument('--track',choices=['practice','debug','mixed','concurrency'],default='practice')
p.add_argument('--mode',choices=['starter','solution'],default='starter')
p.add_argument('--id',default='all',help='Exercise ID, comma-separated IDs, or all')
p.add_argument('--seed',type=int,default=20260924,help='Seed for mixed checks')
a=p.parse_args(); root=Path(__file__).resolve().parents[1]
java=shutil.which('java')
if not java: p.error('Install JDK 17+; JDK 21 recommended.')
compiler=[shutil.which('javac')] if shutil.which('javac') else [java,'-m','jdk.compiler/com.sun.tools.javac.Main']
sources=sorted((root/a.track/a.mode).glob('*.java'))
main={'practice':'PracticeChecks','debug':'BugChecks','mixed':'MixedChecks','concurrency':'ConcurrencyChecks'}[a.track]
sources += [root/a.track/'tests'/(main+'.java')]
try:
 with tempfile.TemporaryDirectory(prefix='roadmap-') as out:
  subprocess.run(compiler+['--release','17','-encoding','UTF-8','-d',out]+list(map(str,sources)),check=True,timeout=60)
  subprocess.run([java,'-cp',out,main,a.id]+([str(a.seed)] if a.track=='mixed' else []),check=True,timeout=30)
except subprocess.TimeoutExpired:
 raise SystemExit('FAIL: timeout; inspect loops/retry bounds.')
except subprocess.CalledProcessError as e:
 raise SystemExit(e.returncode)