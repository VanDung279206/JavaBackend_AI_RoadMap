from pathlib import Path
import json,os,sys,tempfile,unittest
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'scripts'))
import verify,doctor
class VerificationTests(unittest.TestCase):
 def test_blocked_result_cannot_be_reported_as_pass(self):
  with tempfile.TemporaryDirectory() as d:
   r=verify.Runner(Path(d)/'run');r.add('one','PASS','ok');r.add('two','BLOCKED','missing dependency')
   self.assertEqual(r.save(),2);self.assertEqual(json.loads((r.directory/'report.json').read_text())['status'],'BLOCKED')
 def test_failure_takes_precedence_and_preserves_all_rows(self):
  with tempfile.TemporaryDirectory() as d:
   r=verify.Runner(Path(d)/'run');r.add('one','BLOCKED','missing');r.add('two','FAIL','assertion')
   self.assertEqual(r.save(),1);self.assertEqual(len(json.loads((r.directory/'report.json').read_text())['checks']),2)
 def test_expected_exit_still_requires_diagnostic_marker(self):
  with tempfile.TemporaryDirectory() as d:
   r=verify.Runner(Path(d)/'run');okay,_=r.command('wrong-failure',[sys.executable,'-c','raise SystemExit(1)'],expected=1,marker='FAIL')
   self.assertFalse(okay);self.assertEqual(r.rows[0]['status'],'FAIL')
 def test_secret_redaction(self):
  with tempfile.TemporaryDirectory() as d,patch.dict(os.environ,{'TEST_API_KEY':'synthetic-secret'}):
   r=verify.Runner(Path(d)/'run');self.assertNotIn('synthetic-secret',r.redact('key=synthetic-secret'))
 def test_previous_report_directory_is_never_overwritten(self):
  with tempfile.TemporaryDirectory() as d:
   with self.assertRaises(FileExistsError):verify.Runner(Path(d))
 def test_live_does_not_require_docker_for_existing_app(self):
  def command(args,timeout=8):return (0,'openjdk version "17.0.20"' if '-version' in args else 'jdk.compiler@17.0.20')
  with patch.object(doctor.shutil,'which',side_effect=lambda x:'/java' if x=='java' else None),patch.object(doctor,'command',side_effect=command),patch.object(doctor.urllib.request,'urlopen',side_effect=OSError):
   rows=doctor.inspect('live')
  docker=next(x for x in rows if x['name']=='Docker CLI');self.assertEqual(docker['status'],'INFO')
if __name__=='__main__':unittest.main()