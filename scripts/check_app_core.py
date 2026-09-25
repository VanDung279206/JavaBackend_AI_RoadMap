from pathlib import Path
import shutil,subprocess,tempfile
r=Path(__file__).resolve().parents[1]/'projects/knowledge-assistant'
java=shutil.which('java')
if not java: raise SystemExit('Install JDK 17+')
c=[shutil.which('javac')] if shutil.which('javac') else [java,'-m','jdk.compiler/com.sun.tools.javac.Main']
with tempfile.TemporaryDirectory() as out:
 subprocess.run(c+['--release','17','-encoding','UTF-8','-d',out,str(r/'src/main/java/vn/roadmap/knowledge/TextRules.java'),str(r/'checks/CoreChecks.java')],check=True)
 subprocess.run([java,'-cp',out,'CoreChecks'],check=True)