from pathlib import Path
import importlib.util, os, stat, tempfile, unittest

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('runner_job',ROOT/'runner/isolated.py')
runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)

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

if __name__=='__main__':unittest.main()
