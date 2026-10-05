"""Linux regression: run a trusted file-access check as the probe's exact UID."""
import os, subprocess, sys, tempfile
from pathlib import Path
from isolated import prepare_job

def main():
    if os.name!='posix' or os.geteuid()!=0:
        print('BLOCKED: run on Linux as root to drop privileges to UID/GID 65534')
        return 2
    with tempfile.TemporaryDirectory(prefix='roadmap-access-job-') as job:
        with tempfile.TemporaryDirectory(prefix='roadmap-access-original-') as originals:
            original=Path(originals,'AccessFixture.java')
            original.write_text('class AccessFixture {}',encoding='utf8');original.chmod(0o600)
            source=prepare_job(job,[original])
            # No learner code is executed: inspect only our trusted fixture and script.
            check='''import ast,os,pathlib,sys
assert os.getuid()==65534 and os.getgid()==65534
job=pathlib.Path(sys.argv[1]);source=pathlib.Path(sys.argv[2])
assert os.access(job,os.R_OK|os.X_OK) and os.access(source,os.R_OK|os.X_OK)
ast.parse((job/'run.py').read_text())
assert (source/'AccessFixture.java').read_text()=='class AccessFixture {}'
for path in [job,source,job/'run.py',source/'AccessFixture.java']:
 assert not os.access(path,os.W_OK),str(path)
print('PASS UID/GID 65534: traverse/read job and source; no write permission')
'''
            def nobody():
                os.setgroups([]);os.setgid(65534);os.setuid(65534)
            result=subprocess.run([sys.executable,'-c',check,job,str(source)],preexec_fn=nobody,capture_output=True,text=True,timeout=15)
            print(result.stdout,end='');print(result.stderr,end='')
            return result.returncode

if __name__=='__main__':raise SystemExit(main())
