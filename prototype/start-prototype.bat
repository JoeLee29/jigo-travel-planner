@echo off
cd /d "%~dp0"
set "VSNODE=C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs"
if exist "%VSNODE%\npm.cmd" set "PATH=%VSNODE%;%PATH%"
where npm >nul 2>&1
if errorlevel 1 (
  echo Node.js / npm was not found. Install Node LTS, then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing prototype dependencies...
  call npm install
)
echo Opening JIGo prototype at http://localhost:5173
start "" "http://localhost:5173"
call npm run dev
