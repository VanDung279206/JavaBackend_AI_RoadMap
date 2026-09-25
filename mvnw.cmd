@echo off
rem Project launcher for the official Apache Maven Wrapper JAR; requires Python 3.
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 "%~dp0scripts\maven.py" %*
) else (
  python "%~dp0scripts\maven.py" %*
)
exit /b %errorlevel%