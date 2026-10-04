"""Local Docker execution probe. Never issues a verified PASS or changes learner progress."""
import argparse,json,re,subprocess,tempfile,uuid
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FILE_LIMIT=8*1024*1024
OUTPUT_LIMIT=32000
RUN_SCRIPT='''import pathlib,subprocess,json,threading
OUTPUT_LIMIT=32000

def capture(command,timeout):
 # Drain the pipe continuously; retain only bounded diagnostics, never a log file.
 output=bytearray();truncated=False
 with subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.STDOUT) as process:
  def drain():
   nonlocal truncated
   while chunk:=process.stdout.read(8192):
    remaining=OUTPUT_LIMIT-len(output)
    output.extend(chunk[:remaining]);truncated|=len(chunk)>remaining
  reader=threading.Thread(target=drain,daemon=True);reader.start()
  timed_out=False
  try:process.wait(timeout=timeout)
  except subprocess.TimeoutExpired:
   timed_out=True;process.kill();process.wait()
  reader.join(timeout=2)
  if reader.is_alive():raise RuntimeError('Compiler output stream did not close')
 return process.returncode,bytes(output),truncated,timed_out

def compile_java(files,work,timeout=20):
 code,output,truncated,timed_out=capture(['javac','--release','17','-encoding','UTF-8','-proc:none','-d',str(pathlib.Path(work)/'classes')]+list(map(str,files)),timeout)
 return {'verdict':'TIMEOUT' if timed_out else 'BLOCKED' if code==0 else 'COMPILE_ERROR',
         'reason':'Compilation probe only; trusted test worker not deployed',
         'diagnostics':output.decode('utf8',errors='replace'),'output_truncated':truncated}

if __name__=='__main__':
 print(json.dumps(compile_java(list(pathlib.Path('/source').glob('*.java')),'/work'),ensure_ascii=False))
'''

def prepare_job(job,files):
    """Readable snapshot for UID 65534; never chmod the user's originals."""
    job=Path(job)
    source=job/'source';source.mkdir(mode=0o755)
    total=0
    for file in files:
        file=Path(file)
        if file.is_symlink() or not file.is_file():raise ValueError('Use regular Java files')
        content=file.read_bytes();total+=len(content)
        if total>120000:raise ValueError('Source larger than 120 KB')
        target=source/file.name;target.write_bytes(content);target.chmod(0o444)
    script=job/'run.py';script.write_text(RUN_SCRIPT,encoding='utf8');script.chmod(0o444)
    source.chmod(0o755)
    # TemporaryDirectory defaults to 0700 on Linux, which excludes the container UID.
    job.chmod(0o755)
    return source

def command(image,source,job,name):
    if not re.fullmatch(r'[\w./:-]+@sha256:[0-9a-f]{64}',image):raise ValueError('Pin an image digest')
    return ['docker','run','--pull=never','--name',name,'--network=none','--read-only','--user=65534:65534',
      '--cap-drop=ALL','--security-opt=no-new-privileges','--pids-limit=64','--cpus=1',
      '--memory=512m','--memory-swap=512m','--ulimit',f'fsize={FILE_LIMIT}:{FILE_LIMIT}',
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
    # The trusted script drains compiler diagnostics and emits only a bounded JSON result.
    try:
      with tempfile.TemporaryDirectory(prefix='roadmap-job-') as job:
        snapshot=prepare_job(job,files)
        result=subprocess.run(command(a.image,snapshot,job,name),capture_output=True,text=True,timeout=30)
        print(result.stdout[:40000]);print(result.stderr[:2000])
        return 2 if result.returncode==0 else 1
    except (OSError,subprocess.TimeoutExpired,ValueError) as error:
      print('BLOCKED:',type(error).__name__,str(error));return 2
    finally:
      try:subprocess.run(['docker','rm','-f',name],capture_output=True,timeout=10)
      except (OSError,subprocess.TimeoutExpired):pass
if __name__=='__main__':raise SystemExit(main())
