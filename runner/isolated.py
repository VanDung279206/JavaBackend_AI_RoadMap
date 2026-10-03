"""Local Docker execution probe. Never issues a verified PASS or changes learner progress."""
import argparse,json,re,subprocess,tempfile,uuid
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def command(image,source,job,name):
    if not re.fullmatch(r'[\w./:-]+@sha256:[0-9a-f]{64}',image):raise ValueError('Pin an image digest')
    return ['docker','run','--pull=never','--name',name,'--network=none','--read-only','--user=65534:65534',
      '--cap-drop=ALL','--security-opt=no-new-privileges','--pids-limit=64','--cpus=1',
      '--memory=512m','--memory-swap=512m','--ulimit','fsize=4096:4096',
      '--tmpfs','/tmp:rw,noexec,nosuid,size=64m','--tmpfs','/work:rw,nosuid,size=64m',
      '--mount',f'type=bind,source={source},target=/source,readonly',
      '--mount',f'type=bind,source={job},target=/job,readonly',image,'python3','/job/run.py']
def main():
    p=argparse.ArgumentParser();p.add_argument('--id',required=True);p.add_argument('--source',type=Path,required=True);p.add_argument('--image',required=True);a=p.parse_args()
    catalogue=json.loads((ROOT/'learning/catalogue.json').read_text(encoding='utf8'))['exercises']
    entry=catalogue.get(a.id)
    if not entry or entry['check']['kind']!='java':p.error('ID is not supported by the single-group Java probe')
    source=a.source.resolve()
    if not source.is_dir() or any(f.is_symlink() for f in source.rglob('*')):p.error('Use a source directory without symlinks')
    files=list(source.glob('*.java'))
    if not files or sum(f.stat().st_size for f in files)>120000:p.error('Source missing or larger than 120 KB')
    name='roadmap-probe-'+uuid.uuid4().hex
    # Output stays in the bounded container filesystem; docker logs never receives arbitrary program output.
    script='''import pathlib,subprocess,json
files=list(pathlib.Path('/source').glob('*.java'))
with open('/work/output','wb') as out:
 try:
  c=subprocess.run(['javac','--release','17','-d','/work/classes']+list(map(str,files)),stdout=out,stderr=out,timeout=20)
  print(json.dumps({'verdict':'BLOCKED' if c.returncode==0 else 'COMPILE_ERROR','reason':'Compilation probe only; trusted test worker not deployed'}))
 except subprocess.TimeoutExpired:print(json.dumps({'verdict':'TIMEOUT'}))
print(pathlib.Path('/work/output').read_bytes()[:32000].decode('utf8',errors='replace'))
'''
    try:
      with tempfile.TemporaryDirectory(prefix='roadmap-job-') as job:
        Path(job,'run.py').write_text(script,encoding='utf8')
        result=subprocess.run(command(a.image,source,job,name),capture_output=True,text=True,timeout=30)
        print(result.stdout[:40000]);print(result.stderr[:2000])
        return 2 if result.returncode==0 else 1
    except (OSError,subprocess.TimeoutExpired,ValueError) as error:
      print('BLOCKED:',type(error).__name__,str(error));return 2
    finally:
      try:subprocess.run(['docker','rm','-f',name],capture_output=True,timeout=10)
      except (OSError,subprocess.TimeoutExpired):pass
if __name__=='__main__':raise SystemExit(main())
