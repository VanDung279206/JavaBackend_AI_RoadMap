from pathlib import Path
import json,subprocess,sys,tempfile,unittest,importlib.util
ROOT=Path(__file__).resolve().parents[2]
class CatalogueTests(unittest.TestCase):
 def test_catalogue_integrity_and_real_learner_spring_commands(self):
  c=json.loads((ROOT/'learning/catalogue.json').read_text(encoding='utf8'));phases={p['slug'] for p in c['phases']}
  for id,e in c['exercises'].items():
   self.assertIn(e['phase'],phases);self.assertTrue((ROOT/e['reading']).is_file())
   for pre in e['prerequisites']:self.assertIn(pre,c['exercises'])
   if id.startswith(('P3.','P4.')) or id in ('F01','O01'):
    self.assertIn('new_spring_lab.py',e['check']['command']);self.assertIn('work/spring-p',e['check']['command']);self.assertNotIn('-f projects',e['check']['command'])
 def test_spring_copy_starts_with_unfinished_fetch_and_preserves_existing_destination(self):
  with tempfile.TemporaryDirectory() as folder:
   dest=Path(folder)/'learner'
   command=[sys.executable,str(ROOT/'scripts/new_spring_lab.py'),'--phase','3','--destination',str(dest)]
   result=subprocess.run(command,capture_output=True,text=True);self.assertEqual(result.returncode,0,result.stderr)
   query=(dest/'src/main/resources/lab-fetch.jpql').read_text();self.assertNotIn('fetch',query)
   service=(dest/'src/main/java/vn/roadmap/knowledge/DocumentService.java').read_text(encoding='utf8');self.assertIn('TODO P3.1',service)
   sentinel=dest/'mine.txt';sentinel.write_text('keep');self.assertNotEqual(subprocess.run(command,capture_output=True).returncode,0);self.assertEqual(sentinel.read_text(),'keep')
 def test_bad_exercise_id_rejected(self):
  result=subprocess.run([sys.executable,str(ROOT/'scripts/check.py'),'--id','P999.1'],capture_output=True,text=True)
  self.assertNotEqual(result.returncode,0)
 def test_operations_copy_is_not_reference_filter(self):
  with tempfile.TemporaryDirectory() as folder:
   dest=Path(folder)/'learner'
   result=subprocess.run([sys.executable,str(ROOT/'scripts/new_spring_lab.py'),'--phase','4','--destination',str(dest)],capture_output=True,text=True)
   self.assertEqual(result.returncode,0,result.stderr)
   source=(dest/'src/main/java/vn/roadmap/knowledge/RequestMetricsFilter.java').read_text(encoding='utf8')
   self.assertIn('TODO O01',source)
   self.assertNotIn('setHeader',source)
 def test_runner_requires_digest_and_limits_every_resource(self):
  spec=importlib.util.spec_from_file_location('isolated',ROOT/'runner/isolated.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  with self.assertRaises(ValueError):module.command('jdk:latest','source','job','name')
  args=module.command('jdk@sha256:'+'0'*64,'source','job','name')
  for limit in ['--network=none','--read-only','--user=65534:65534','--cap-drop=ALL','--pids-limit=64','--cpus=1','--memory=512m','--security-opt=no-new-privileges','--pull=never']:self.assertIn(limit,args)
  self.assertEqual(sum('readonly' in a for a in args),2)
if __name__=='__main__':unittest.main()
