"""Read-only environment check. Never displays passwords, tokens or API keys."""
from pathlib import Path
import argparse,json,os,re,shutil,socket,subprocess,sys,urllib.request
ROOT=Path(__file__).resolve().parents[1]
def command(args,timeout=8):
 try:
  r=subprocess.run(args,capture_output=True,text=True,timeout=timeout)
  return r.returncode,r.stdout+r.stderr
 except (OSError,subprocess.TimeoutExpired) as e:return 2,type(e).__name__
def inspect(profile='offline',network=False):
 results=[]
 def add(name,okay,detail,required=True):results.append({'name':name,'status':'PASS' if okay else ('BLOCKED' if required else 'INFO'),'detail':detail})
 add('Python',sys.version_info>=(3,10),'Requires Python 3.10+ for learning tools')
 add('Python assertions',sys.flags.optimize==0,'Run without -O / PYTHONOPTIMIZE so contract assertions remain active')
 java=shutil.which('java')
 if java:
  code,text=command([java,'-version']);match=re.search(r'version "(\d+)',text)
  add('JDK',code==0 and bool(match) and int(match.group(1))>=17,'Java 17+ required; 21 recommended')
  code,modules=command([java,'--list-modules'])
  add('Compiler',code==0 and 'jdk.compiler@' in modules,'A full JDK/compiler module is required')
 else:add('JDK',False,'java not found on PATH')
 add('Git',bool(shutil.which('git')),'Needed when committing work',False)
 add('Wrapper configuration',(ROOT/'.mvn/wrapper/maven-wrapper.properties').is_file(),'Pinned wrapper/distribution configuration')
 if profile!='offline':
  jar=ROOT/'.mvn/wrapper/maven-wrapper.jar'
  add('Wrapper JAR cached',jar.is_file(),'First wrapper run needs Maven Central when not cached',False)
  docker=shutil.which('docker');add('Docker CLI',bool(docker),'Required for integration/container suites; informational for an already-running live app',profile=='integration')
  if docker:
   code,_=command([docker,'info','--format','{{.ServerVersion}}'])
   add('Docker daemon',code==0,'Docker server must be running for container creation',profile=='integration')
  add('PostgreSQL client',bool(shutil.which('psql')),'Optional: SQL labs can use psql inside the database container',False)
  for port in [8080,5432]:
   with socket.socket() as s:
    s.settimeout(.3);busy=s.connect_ex(('127.0.0.1',port))==0
   add('Port '+str(port),not busy,'Occupied: inspect the existing service' if busy else 'Available',False)
 if profile=='live':
  for key in ['DB_PASSWORD','APP_AN_PASSWORD','APP_BINH_PASSWORD','OLLAMA_CHAT_MODEL','OLLAMA_EMBED_MODEL','EMBEDDING_DIMENSIONS']:
   add('Environment '+key,bool(os.environ.get(key,'').strip()),'Set' if os.environ.get(key,'').strip() else 'Missing')
  raw=os.environ.get('EMBEDDING_DIMENSIONS','')
  add('Embedding dimensions',raw.isdigit() and int(raw)>0,'Must be a positive integer matching the actual model')
  base=os.environ.get('OLLAMA_BASE_URL','http://localhost:11434').rstrip('/')
  try:
   with urllib.request.urlopen(base+'/api/tags',timeout=3) as response:data=json.load(response)
   names={item.get('name') for item in data.get('models',[])}
   for key in ['OLLAMA_CHAT_MODEL','OLLAMA_EMBED_MODEL']:
    model=os.environ.get(key,'');add('Available '+key,model in names or model+':latest' in names,'Checks model tag presence, not model quality')
  except Exception as e:add('Ollama',False,'Cannot read local model list: '+type(e).__name__)
 if network:
  try:
   with urllib.request.urlopen('https://repo.maven.apache.org/maven2/',timeout=5) as response:okay=response.status==200
   add('Maven Central',okay,'Repository connection probe')
  except Exception as e:add('Maven Central',False,'Connection failed: '+type(e).__name__)
 return results
def main():
 p=argparse.ArgumentParser();p.add_argument('--profile',choices=['offline','integration','live'],default='offline');p.add_argument('--network',action='store_true');p.add_argument('--json',type=Path);a=p.parse_args()
 result=inspect(a.profile,a.network)
 for item in result:print(item['status'],item['name']+' — '+item['detail'])
 if a.json:a.json.parent.mkdir(parents=True,exist_ok=True);a.json.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 return 2 if any(x['status']=='BLOCKED' for x in result) else 0
if __name__=='__main__':raise SystemExit(main())