"""Run reference gates. PASS/FAIL/BLOCKED remain distinct in the saved report."""
from pathlib import Path
from datetime import datetime,timezone
import argparse,json,os,re,shutil,subprocess,sys,time,uuid,urllib.request
import doctor
from http_smoke import Client,Blocked,exercise
ROOT=Path(__file__).resolve().parents[1]
class Runner:
 def __init__(self,directory):
  self.directory=directory;directory.mkdir(parents=True,exist_ok=False);self.rows=[]
 def add(self,name,status,detail,**extra):
  row={'name':name,'status':status,'detail':detail,**extra};self.rows.append(row);print(status,name,'—',detail,flush=True);return row
 def redact(self,text):
  for key,value in os.environ.items():
   if re.search(r'PASSWORD|TOKEN|SECRET|API_KEY',key,re.I) and len(value)>=4:text=text.replace(value,'<redacted>')
  return text
 def command(self,name,args,timeout=120,expected=0,marker=None,env=None,input_text=None):
  print('RUN',name,flush=True);log=self.directory/(re.sub(r'[^a-zA-Z0-9_-]','_',name)+'.log');start=time.monotonic()
  try:
   result=subprocess.run(args,cwd=ROOT,capture_output=True,text=True,timeout=timeout,env=env,input=input_text)
   output=self.redact(result.stdout+result.stderr);log.write_text(output,encoding='utf-8')
   okay=result.returncode==expected and (marker is None or marker in output)
   blocked=not okay and result.returncode==2 and 'BLOCKED:' in output
   self.add(name,'PASS' if okay else 'BLOCKED' if blocked else 'FAIL',f'exit={result.returncode}',log=log.name,elapsed_seconds=round(time.monotonic()-start,2))
   return okay,result.stdout.strip()
  except (OSError,subprocess.TimeoutExpired) as error:
   log.write_text(type(error).__name__+'\n',encoding='utf-8');self.add(name,'BLOCKED' if isinstance(error,OSError) else 'FAIL',type(error).__name__,log=log.name);return False,''
 def doctor(self,profile):
  rows=doctor.inspect(profile);(self.directory/('doctor-'+profile+'.json')).write_text(json.dumps(rows,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
  missing=[x['name'] for x in rows if x['status']=='BLOCKED']
  self.add('environment-'+profile,'BLOCKED' if missing else 'PASS',', '.join(missing) if missing else 'Required probes passed')
  return not missing
 def save(self):
  status='FAIL' if any(r['status']=='FAIL' for r in self.rows) else 'BLOCKED' if any(r['status']=='BLOCKED' for r in self.rows) else 'PASS'
  report={'created_at':datetime.now(timezone.utc).isoformat(),'scope':'reference verification; not learner completion','status':status,'checks':self.rows}
  (self.directory/'report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print('REPORT',self.directory/'report.json',flush=True)
  return {'PASS':0,'FAIL':1,'BLOCKED':2}[status]

def offline(r):
 if not r.doctor('offline'):
  r.add('offline-programs','BLOCKED','JDK/Python prerequisites missing');return
 commands=[('legacy-labs',[sys.executable,'labs/run_checks.py']),('practice-reference',[sys.executable,'scripts/check.py','--mode','solution']),('debug-reference',[sys.executable,'scripts/check.py','--track','debug','--mode','solution']),('mixed-reference',[sys.executable,'scripts/check.py','--track','mixed','--mode','solution']),('concurrency-reference',[sys.executable,'scripts/check.py','--track','concurrency','--mode','solution']),('app-core',[sys.executable,'scripts/check_app_core.py']),('learning-tools',[sys.executable,'-m','unittest','discover','-s','scripts/tests','-v']),('english-diagnostics',[sys.executable,'scripts/error_examples.py','--verify'])]
 for name,args in commands:r.command(name,args)
 for track,id in [('practice','P1.1'),('debug','B01'),('mixed','M01'),('concurrency','C01')]:
  r.command(track+'-rejects-unfinished-starter',[sys.executable,'scripts/check.py','--track',track,'--id',id],expected=1,marker='FAIL')

def wait_until(action,timeout):
 deadline=time.monotonic()+timeout
 while time.monotonic()<deadline:
  try:
   result=action()
   if result:return result
  except Exception:pass
  time.sleep(.5)
 raise TimeoutError('Service did not become ready')

def containers(r):
 docker=shutil.which('docker');suffix=uuid.uuid4().hex[:16];prefix='roadmap-'+suffix
 network=prefix;db=prefix+'-db';app=prefix+'-app';tag='roadmap-verify:'+suffix
 env=os.environ.copy();env.update({'POSTGRES_PASSWORD':uuid.uuid4().hex,'APP_AN_PASSWORD':'verify-an-'+suffix,'APP_BINH_PASSWORD':'verify-binh-'+suffix})
 env['DB_PASSWORD']=env['POSTGRES_PASSWORD'];created=[];network_created=False;image_created=False
 def run(args,timeout=120):
  result=subprocess.run([docker,*args],capture_output=True,text=True,timeout=timeout,env=env)
  if result.returncode:raise RuntimeError('Docker command failed: '+args[0])
  return result.stdout.strip()
 def base():
  port=run(['port',app,'8080/tcp']).splitlines()[0].rsplit(':',1)[-1]
  return 'http://127.0.0.1:'+port
 def health(url):
  with urllib.request.urlopen(url+'/health',timeout=2) as response:return response.status==200
 try:
  run(['network','create',network]);network_created=True
  run(['run','-d','--name',db,'--label','roadmap.run='+suffix,'--network',network,'--network-alias','db','-e','POSTGRES_PASSWORD','-e','POSTGRES_USER=knowledge','-e','POSTGRES_DB=knowledge','postgres:17'],timeout=300);created.append(db)
  wait_until(lambda:subprocess.run([docker,'exec',db,'pg_isready','-h','127.0.0.1','-U','knowledge','-d','knowledge'],capture_output=True).returncode==0,90)
  sql='\n'.join((ROOT/'practice/sql'/p).read_text() for p in ['fixture.sql','solution.sql','tests.sql'])
  okay,_=r.command('sql-postgres-fixture',[docker,'exec','-i',db,'psql','-v','ON_ERROR_STOP=1','-U','knowledge','-d','knowledge'],input_text=sql,marker='PASS P2.2 P2.3 P2.4')
  if not okay:raise RuntimeError('SQL fixture assertions failed')
  okay,_=r.command('docker-build',[docker,'build','-t',tag,'projects/knowledge-assistant'],timeout=1200)
  if not okay:raise RuntimeError('Docker build failed')
  image_created=True
  run(['run','-d','--name',app,'--label','roadmap.run='+suffix,'--network',network,'-p','127.0.0.1::8080','-e','SERVER_ADDRESS=0.0.0.0','-e','SPRING_PROFILES_ACTIVE=postgres','-e','DB_URL=jdbc:postgresql://db:5432/knowledge','-e','DB_USER=knowledge','-e','DB_PASSWORD','-e','APP_AN_PASSWORD','-e','APP_BINH_PASSWORD',tag]);created.append(app)
  url=base();wait_until(lambda:health(url),90)
  def restart():
   run(['restart',app]);new_base=base();wait_until(lambda:health(new_base),90);return new_base
  client=Client(url,{'an':env['APP_AN_PASSWORD'],'binh':env['APP_BINH_PASSWORD']})
  evidence=exercise(client,restart=restart)
  (r.directory/'docker-http.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  r.add('docker-http-postgres','PASS','CRUD, owner, stale write, app restart persistence and fixture cleanup')
 except Exception as error:r.add('container-suite','FAIL',type(error).__name__+': '+str(error))
 finally:
  cleanup_errors=[]
  for name in reversed(created):
   try:run(['rm','-f','-v',name])
   except Exception:cleanup_errors.append(name)
  if network_created:
   try:run(['network','rm',network])
   except Exception:cleanup_errors.append(network)
  if image_created:
   try:run(['image','rm',tag])
   except Exception:cleanup_errors.append(tag)
  if cleanup_errors:r.add('container-cleanup','FAIL','Remove only these resources from this run: '+', '.join(cleanup_errors))

def integration(r):
 env_ok=r.doctor('integration')
 bootstrap,_=r.command('maven-wrapper-bootstrap',[sys.executable,'scripts/maven.py','-version'],timeout=120)
 if not env_ok or not bootstrap:
  for name in ['maven-junit','spring-postgres-tests','real-ai-adapter-build','sql-postgres-fixture','docker-http-postgres']:r.add(name,'BLOCKED','Prerequisite check failed; this gate was not run')
  return
 commands=[('maven-junit',['-f','practice/pom.xml','clean','test','-Dcode.mode=solution']),('spring-postgres-tests',['-f','projects/knowledge-assistant/pom.xml','-Pintegration','clean','verify']),('real-ai-adapter-build',['-f','projects/knowledge-assistant/pom.xml','-Preal-ai','clean','verify'])]
 for name,args in commands:r.command(name,[sys.executable,'scripts/maven.py','-B',*args],timeout=1200)
 containers(r)

def live(r,base):
 if not r.doctor('live'):r.add('live-http-ai','BLOCKED','Live provider configuration incomplete; no model evaluation was run');return
 client=Client(base,{'an':os.environ['APP_AN_PASSWORD'],'binh':os.environ['APP_BINH_PASSWORD']});evidence={}
 try:
  exercise(client,live=True,evidence=evidence)
  (r.directory/'live-ai.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  r.add('live-http-ai','PASS','Structural/ownership/version checks passed; semantic_review=REQUIRED')
  r.add('live-semantic-review','BLOCKED','Read live-ai.json and grade factual support manually; automated checks cannot certify it')
 except Blocked as error:r.add('live-http-ai','BLOCKED',str(error))
 except Exception as error:
  (r.directory/'live-http-calls.json').write_text(json.dumps(client.calls,indent=2)+'\n',encoding='utf-8')
  r.add('live-http-ai','FAIL',type(error).__name__+': '+str(error))
 finally:
  (r.directory/'live-ai.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def main():
 p=argparse.ArgumentParser();p.add_argument('--suite',choices=['offline','integration','live','all'],default='offline');p.add_argument('--base-url',default='http://127.0.0.1:8080');p.add_argument('--output',type=Path)
 a=p.parse_args();stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')+'-'+uuid.uuid4().hex[:6]
 directory=a.output or ROOT/'checks/runs'/stamp
 try:r=Runner(directory)
 except FileExistsError:p.error('Output directory exists; choose a new path to preserve the previous report')
 try:
  if a.suite in ['offline','all']:offline(r)
  if a.suite in ['integration','all']:integration(r)
  if a.suite in ['live','all']:live(r,a.base_url)
 except KeyboardInterrupt:r.add('run-interrupted','BLOCKED','Interrupted by user')
 except Exception as error:r.add('runner','FAIL',type(error).__name__+': '+str(error))
 return r.save()
if __name__=='__main__':raise SystemExit(main())