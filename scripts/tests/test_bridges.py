from pathlib import Path
import json
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "projects/knowledge-assistant/src/main"


class BridgeCopyTests(unittest.TestCase):
    def test_each_step_changes_only_one_source_and_preserves_prior_attempt(self):
        targets = {
            "validation": ("java/vn/roadmap/knowledge/ApiTypes.java", "TODO SPRB01"),
            "repository": ("java/vn/roadmap/knowledge/DocumentService.java", "TODO SPRB02"),
            "transaction": ("java/vn/roadmap/knowledge/DocumentService.java", "TODO SPRB03"),
        }
        with tempfile.TemporaryDirectory() as folder:
            for step, (target, marker) in targets.items():
                destination = Path(folder) / step
                command = [sys.executable, str(ROOT / "scripts/new_spring_lab.py"), "--phase", "3",
                           "--step", step, "--destination", str(destination)]
                result = subprocess.run(command, capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
                changed = [str(file.relative_to(SOURCE)).replace("\\", "/") for file in SOURCE.rglob("*")
                           if file.is_file() and file.read_bytes() != (destination / "src/main" / file.relative_to(SOURCE)).read_bytes()]
                self.assertEqual(changed, [target])
                code = (destination / "src/main" / target).read_text(encoding="utf-8")
                self.assertIn(marker, code)
                self.assertNotIn("TODO P3.", code)
                self.assertNotEqual(subprocess.run(command, capture_output=True).returncode, 0)
                self.assertEqual((destination / "src/main" / target).read_text(encoding="utf-8"), code)

    def test_step_in_phase_four_is_rejected_without_creating_a_copy(self):
        with tempfile.TemporaryDirectory() as folder:
            destination = Path(folder) / "invalid"
            result = subprocess.run([sys.executable, str(ROOT / "scripts/new_spring_lab.py"),
                                     "--phase", "4", "--step", "validation", "--destination", str(destination)],
                                    capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(destination.exists())

    def test_bridge_commands_target_the_learners_isolated_copy(self):
        catalogue = json.loads((ROOT / "learning/catalogue.json").read_text(encoding="utf-8"))["exercises"]
        for number, (step, test) in enumerate([
            ("validation", "BridgeValidationTest"), ("repository", "BridgeRepositoryTest"),
            ("transaction", "BridgeTransactionTest")
        ], 1):
            command = catalogue[f"SPRB0{number}"]["check"]["command"]
            self.assertIn("--step " + step, command)
            self.assertIn("-Dtest=" + test, command)
            self.assertIn("work/spring-bridge-" + step + "/pom.xml", command)
            self.assertNotIn("-f projects/", command)


if __name__ == "__main__":
    unittest.main()
