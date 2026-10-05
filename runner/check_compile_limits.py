"""Compile a trusted repository fixture under the probe's exact Linux UID/fsize.

This is a syscall regression, not a Docker run or a learner grading worker.
"""
import os, subprocess, sys, tempfile
from isolated import ROOT, command, prepare_job

CHECK='''import errno,json,os,pathlib,resource,runpy,sys
assert os.getuid()==65534 and os.getgid()==65534
job,work,soft,hard=sys.argv[1:];work=pathlib.Path(work)
assert resource.getrlimit(resource.RLIMIT_FSIZE)==(int(soft),int(hard))
runtime=runpy.run_path(str(pathlib.Path(job)/'run.py'))
result=runtime['compile_java'](list((pathlib.Path(job)/'source').glob('*.java')),work)
if int(soft)==4096:
 assert result['verdict']=='COMPILE_ERROR',result
 assert 'File too large' in result['diagnostics'],result
 print('PASS negative control: 4096-byte fsize rejects valid MoreDsa bytecode')
else:
 assert result['verdict']=='BLOCKED' and not result['diagnostics'],result
 size=(work/'classes/MoreDsa.class').stat().st_size
 assert 4096<size<int(soft),size
 try:
  with open(work/'oversized.bin','wb') as file:file.truncate(int(soft)+1)
 except OSError as error:assert error.errno==errno.EFBIG,error
 else:raise AssertionError('Linux file limit was not enforced')
 print(f'PASS UID/GID 65534: compiled MoreDsa.class {size} bytes with fsize={soft}; oversized file rejected; verdict BLOCKED')
'''

def main():
    if os.name!='posix' or os.geteuid()!=0:
        print('BLOCKED: run on Linux as root to apply fsize and UID/GID 65534')
        return 2
    import resource
    args=command('jdk@sha256:'+'0'*64,'source','job','name')
    soft,hard=map(int,args[args.index('--ulimit')+1].removeprefix('fsize=').split(':'))
    with tempfile.TemporaryDirectory(prefix='roadmap-compile-job-') as job:
        prepare_job(job,[ROOT/'practice/solution/MoreDsa.java'])
        for limits in [(4096,4096),(soft,hard)]:
            with tempfile.TemporaryDirectory(prefix='roadmap-compile-work-') as work:
                os.chown(work,65534,65534)
                def nobody():
                    resource.setrlimit(resource.RLIMIT_FSIZE,limits)
                    os.setgroups([]);os.setgid(65534);os.setuid(65534)
                result=subprocess.run([sys.executable,'-c',CHECK,job,work,*map(str,limits)],preexec_fn=nobody,capture_output=True,text=True,timeout=30,env={**os.environ,'LC_ALL':'C.UTF-8'})
                print(result.stdout,end='');print(result.stderr,end='')
                if result.returncode:return result.returncode
    return 0

if __name__=='__main__':raise SystemExit(main())
