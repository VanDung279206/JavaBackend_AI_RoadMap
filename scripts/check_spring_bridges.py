"""Prove each isolated Spring starter fails its contract and its repair passes.

Only generated copies in a TemporaryDirectory are repaired. Never edit a learner's
existing work or count these reference results as learner completion.
"""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "projects/knowledge-assistant"
CASES = [
    ("validation", "BridgeValidationTest", "ApiTypes.java", "invalid title must fail DTO validation"),
    ("repository", "BridgeRepositoryTest", "DocumentService.java", "TODO SPRB02"),
    ("transaction", "BridgeTransactionTest", "DocumentService.java", "failed create must leave no document"),
]


def run_contract(directory, selection, expect_failure=False, marker=None):
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts/maven.py"), "-B", "-f", str(directory / "pom.xml"),
         "clean", "test", "-Dtest=" + selection],
        cwd=ROOT, capture_output=True, text=True, timeout=300,
    )
    print(result.stdout + result.stderr, flush=True)
    reports = [ET.parse(file).getroot() for file in (directory / "target/surefire-reports").glob("TEST-*Bridge*Test.xml")]
    tests = sum(int(report.get("tests", "0")) for report in reports)
    failures = sum(int(report.get("failures", "0")) + int(report.get("errors", "0")) for report in reports)
    skipped = sum(int(report.get("skipped", "0")) for report in reports)
    expected_tests = 4 if selection == "Bridge*Test" else 2 if selection == "BridgeTransactionTest" else 1
    if tests != expected_tests or skipped:
        raise RuntimeError(f"{selection}: expected {expected_tests} executed tests, got {tests}, skipped={skipped}")
    if expect_failure:
        diagnostics = "\n".join(ET.tostring(report, encoding="unicode") for report in reports)
        if result.returncode == 0 or failures == 0 or marker not in diagnostics:
            raise RuntimeError(f"{selection}: unfinished starter did not fail for the expected reason")
    elif result.returncode != 0 or failures:
        raise RuntimeError(f"{selection}: repaired bridge failed")


def main():
    with tempfile.TemporaryDirectory(prefix="roadmap-spring-bridge-") as folder:
        for step, test, source, marker in CASES:
            destination = Path(folder) / step
            subprocess.run(
                [sys.executable, str(ROOT / "scripts/new_spring_lab.py"), "--phase", "3",
                 "--step", step, "--destination", str(destination)], check=True, cwd=ROOT,
            )
            run_contract(destination, test, expect_failure=True, marker=marker)
            relative = Path("src/main/java/vn/roadmap/knowledge") / source
            shutil.copyfile(REFERENCE / relative, destination / relative)
            run_contract(destination, "Bridge*Test")
            print("PASS Spring bridge:", step, "starter rejected; repaired contracts passed", flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, subprocess.SubprocessError, ET.ParseError) as error:
        print("FAIL Spring bridges:", error, file=sys.stderr)
        raise SystemExit(1)
