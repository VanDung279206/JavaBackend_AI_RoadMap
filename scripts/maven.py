"""Project launcher; executes Apache Maven Wrapper 3.3.4, not a reimplementation of Maven.
Downloads only the official versioned wrapper JAR on first use. Maven Wrapper then
resolves the pinned Maven distribution. This launcher needs Python 3 and a JDK.
"""
from pathlib import Path
import os,shlex,shutil,subprocess,sys,tempfile,urllib.request,zipfile
ROOT=Path(__file__).resolve().parents[1]
URL='https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.4/maven-wrapper-3.3.4.jar'
def main(argv=None):
 args=sys.argv[1:] if argv is None else argv
 java_home=os.environ.get('JAVA_HOME')
 java=str(Path(java_home)/'bin'/('java.exe' if os.name=='nt' else 'java')) if java_home else shutil.which('java')
 if not java or not Path(java).is_file():
  print('BLOCKED: JDK not found. Check JAVA_HOME and PATH.',file=sys.stderr);return 2
 jar=ROOT/'.mvn/wrapper/maven-wrapper.jar'
 if not jar.exists():
  temporary=None
  try:
   with urllib.request.urlopen(URL,timeout=8) as response:
    with tempfile.NamedTemporaryFile(dir=jar.parent,suffix='.part',delete=False) as out:
     temporary=Path(out.name);shutil.copyfileobj(response,out)
   with zipfile.ZipFile(temporary) as archive:
    if 'org/apache/maven/wrapper/MavenWrapperMain.class' not in archive.namelist():
     raise ValueError('Downloaded file is not a Maven Wrapper JAR')
   temporary.replace(jar)
  except Exception as error:
   if temporary:temporary.unlink(missing_ok=True)
   print('BLOCKED: cannot download the official Maven Wrapper JAR ('+type(error).__name__+'). Check network/proxy, then retry.',file=sys.stderr)
   return 2
 try:
  options=shlex.split(os.environ.get('MAVEN_OPTS',''),posix=os.name!='nt')
  command=[java,*options,'-Dmaven.multiModuleProjectDirectory='+str(ROOT),'-classpath',str(jar),'org.apache.maven.wrapper.MavenWrapperMain',*args]
  return subprocess.run(command,cwd=ROOT).returncode
 except OSError as error:
  print('BLOCKED: cannot launch Java ('+type(error).__name__+').',file=sys.stderr);return 2
if __name__=='__main__':raise SystemExit(main())