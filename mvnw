#!/bin/sh
# Project launcher for the official Apache Maven Wrapper JAR; requires Python 3.
base=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 1
exec python3 "$base/scripts/maven.py" "$@"