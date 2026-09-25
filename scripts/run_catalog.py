from pathlib import Path
import argparse,shutil,subprocess,tempfile
p=argparse.ArgumentParser();p.add_argument('--mode',choices=['starter','solution'],default='starter');a=p.parse_args()
r=Path(__file__).resolve().parents[1];java=shutil.which('java')
if not java:raise SystemExit('Install JDK 17+')
c=[shutil.which('javac')] if shutil.which('javac') else [java,'-m','jdk.compiler/com.sun.tools.javac.Main']
with tempfile.TemporaryDirectory() as out:
 subprocess.run(c+['--release','17','-encoding','UTF-8','-d',out,str(r/'practice'/a.mode/'JavaCoreLab.java'),str(r/'projects/catalog-cli/CatalogCli.java')],check=True)
 subprocess.run([java,'-cp',out,'CatalogCli'],check=True)