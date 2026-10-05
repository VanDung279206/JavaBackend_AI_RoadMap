from pathlib import Path
import importlib.util, os, stat, subprocess, sys, tempfile, unittest

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('runner_job',ROOT/'runner/isolated.py')
runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
runtime={'__name__':'trusted_probe_test'}
exec(runner.RUN_SCRIPT,runtime)

class RunnerJobTests(unittest.TestCase):
 def test_private_source_is_snapshotted_without_changing_the_original(self):
  with tempfile.TemporaryDirectory() as originals, tempfile.TemporaryDirectory() as job:
   original=Path(originals,'Example.java');original.write_text('class Example {}');original.chmod(0o600)
   mode=stat.S_IMODE(original.stat().st_mode)
   source=runner.prepare_job(job,[original])
   self.assertEqual((source/'Example.java').read_bytes(),original.read_bytes())
   self.assertEqual(stat.S_IMODE(original.stat().st_mode),mode)
   self.assertEqual(Path(job,'run.py').read_text(),runner.RUN_SCRIPT)
   if os.name=='posix':
    self.assertEqual(stat.S_IMODE(Path(job).stat().st_mode),0o755)
    self.assertEqual(stat.S_IMODE(source.stat().st_mode),0o755)
    self.assertEqual(stat.S_IMODE(Path(job,'run.py').stat().st_mode),0o444)
    self.assertEqual(stat.S_IMODE((source/'Example.java').stat().st_mode),0o444)
 def test_snapshot_rechecks_size_instead_of_trusting_an_earlier_stat(self):
  with tempfile.TemporaryDirectory() as originals, tempfile.TemporaryDirectory() as job:
   original=Path(originals,'Example.java');original.write_bytes(b'x'*120001)
   with self.assertRaisesRegex(ValueError,'120 KB'):runner.prepare_job(job,[original])
 def test_file_limit_accepts_real_repository_bytecode_larger_than_four_kib(self):
  with tempfile.TemporaryDirectory() as folder:
   result=subprocess.run(['javac','--release','17','-encoding','UTF-8','-d',folder,str(ROOT/'practice/solution/MoreDsa.java')],capture_output=True,text=True,timeout=30)
   self.assertEqual(result.returncode,0,result.stderr)
   size=Path(folder,'MoreDsa.class').stat().st_size
   self.assertGreater(size,4096)
   args=runner.command('jdk@sha256:'+'0'*64,'source','job','name')
   limit=args[args.index('--ulimit')+1]
   soft,hard=map(int,limit.removeprefix('fsize=').split(':'))
   self.assertGreaterEqual(soft,size,'valid bytecode exceeds the Docker file limit')
   self.assertEqual(soft,hard)
   self.assertLess(soft,64*1024*1024,'per-file limit must stay below the work tmpfs')
 def test_runtime_reports_real_compile_error_and_never_grants_pass(self):
  with tempfile.TemporaryDirectory() as folder:
   source=Path(folder,'Broken.java');source.write_text('class Broken { invalid syntax }')
   result=runtime['compile_java']([source],folder)
   self.assertEqual(result['verdict'],'COMPILE_ERROR')
   self.assertIn('error',result['diagnostics'])
   result=runtime['compile_java']([ROOT/'practice/solution/MoreDsa.java'],folder)
   self.assertEqual(result['verdict'],'BLOCKED')
   self.assertGreater(Path(folder,'classes/MoreDsa.class').stat().st_size,4096)
 def test_diagnostics_are_drained_without_unbounded_retention(self):
  code,output,truncated,timed_out=runtime['capture']([sys.executable,'-c',"import sys;sys.stdout.buffer.write(b'x'*2000000);sys.stderr.buffer.write(b'y'*2000000)"],10)
  self.assertEqual(code,0);self.assertFalse(timed_out);self.assertTrue(truncated)
  self.assertEqual(len(output),runner.OUTPUT_LIMIT)
  self.assertEqual(output,b'x'*runner.OUTPUT_LIMIT)
 def test_timeout_kills_compiler_and_preserves_bounded_diagnostics(self):
  code,output,truncated,timed_out=runtime['capture']([sys.executable,'-c',"import time;print('started',flush=True);time.sleep(30)"],0.5)
  self.assertTrue(timed_out);self.assertNotEqual(code,0)
  self.assertEqual(output,b'started'+os.linesep.encode());self.assertFalse(truncated)

if __name__=='__main__':unittest.main()
