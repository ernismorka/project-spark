@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 from https://nodejs.org/ then reopen this launcher.
  echo Idiek Node.js 24 ir paleisk si faila dar karta.
  pause
  exit /b 1
)
node "%~dp0server.mjs" --open
if errorlevel 1 pause
