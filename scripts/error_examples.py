"""Run deliberate failures; --verify verifies diagnostics, never marks exercises done."""
from pathlib import Path
import argparse,shutil,subprocess,tempfile,json
ROOT=Path(__file__).resolve().parents[1]
EXPECTED={'E01':'NullPointerException','E02':'ArrayIndexOutOfBoundsException','E03':'NumberFormatException','E04':'IllegalArgumentException: duplicate id','E05':'UnsupportedOperationException: TODO P1.1','E06':'AssertionError: expected=3 actual=2','E07':'TimeoutException','E08':'cannot find symbol'}
def collect(ids):
 java=shutil.which('java')
 if not java: raise RuntimeError('JDK required')
 compiler=[shutil.which('javac')] if shutil.which('javac') else [java,'-m','jdk.compiler/com.sun.tools.javac.Main']
 rows=[]
 with tempfile.TemporaryDirectory(prefix='roadmap-errors-') as directory:
  subprocess.run(compiler+['--release','17','-encoding','UTF-8','-d',directory,str(ROOT/'english/fixtures/ErrorExamples.java'),str(ROOT/'practice/solution/JavaCoreLab.java')],check=True,capture_output=True,text=True,timeout=30)
  for id in ids:
   if id=='E08':
    src=Path(directory)/'MissingSymbol.java';src.write_text((ROOT/'english/fixtures/MissingSymbol.java.txt').read_text())
    command=compiler+['-J-Duser.language=en'] if shutil.which('javac') else compiler[:1]+['-Duser.language=en']+compiler[1:]
    command+=['-d',directory,str(src)]
   else: command=[java,'-Duser.language=en','-cp',directory,'ErrorExamples',id]
   result=subprocess.run(command,capture_output=True,text=True,timeout=10)
   output=result.stdout+result.stderr
   rows.append({'id':id,'exit_code':result.returncode,'diagnostic_verified':result.returncode!=0 and EXPECTED[id] in output,'output':output.replace(directory,'<temporary-directory>')})
 return rows

def main():
 p=argparse.ArgumentParser();p.add_argument('id',nargs='?',choices=list(EXPECTED));p.add_argument('--verify',action='store_true');p.add_argument('--json',type=Path);a=p.parse_args()
 if not a.id and not a.verify:p.error('Choose E01..E08 or --verify')
 rows=collect([a.id] if a.id else list(EXPECTED))
 if a.json:a.json.parent.mkdir(parents=True,exist_ok=True);a.json.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 for row in rows:
  if a.verify:print(('PASS' if row['diagnostic_verified'] else 'FAIL'),'expected diagnostic',row['id'])
  else:print(row['output'],end='')
 if a.verify:return 0 if all(r['diagnostic_verified'] for r in rows) else 1
 return rows[0]['exit_code']
if __name__=='__main__':raise SystemExit(main())