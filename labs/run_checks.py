"""Compile and run the dependency-free Java exercises; Python 3 and JDK 17+ required."""
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parent
java = shutil.which("java")
if not java:
    raise SystemExit("Install JDK 17+ (JDK 21 recommended) and add java to PATH.")
javac = shutil.which("javac")
compiler = [javac] if javac else [java, "-m", "jdk.compiler/com.sun.tools.javac.Main"]
sources = sorted(str(p) for p in (root / "src").glob("*.java"))
with tempfile.TemporaryDirectory(prefix="java-roadmap-checks-") as output:
    subprocess.run(compiler + ["--release", "17", "-encoding", "UTF-8", "-d", output] + sources, check=True)
    subprocess.run([java, "-cp", output, "LabChecks"], check=True)