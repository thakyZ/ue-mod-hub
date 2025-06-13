@echo off
set "EXE_NAME=UE Mod Hub.exe"
set "LOG_FILE=UE Mod Hub Debug.txt"

echo Running %EXE_NAME%... > "%LOG_FILE%"
echo --------------------------- >> "%LOG_FILE%"

echo Running %EXE_NAME%...
echo ---------------------------

"%~dp0%EXE_NAME%" >> "%LOG_FILE%" 2>&1

echo --------------------------- >> "%LOG_FILE%"
echo Program exited with code %ERRORLEVEL% >> "%LOG_FILE%"

echo ---------------------------
echo Program exited with code %ERRORLEVEL%
