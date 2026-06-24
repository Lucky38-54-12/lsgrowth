@echo off
REM Start LS Growth Email Monitor Daemon
REM This runs in the background and checks sheets every 30 minutes

cd /d "%~dp0"

echo Starting LS Growth Email Monitor Daemon...
echo.

REM Install node-cron if not installed
if not exist "node_modules\node-cron" (
  echo Installing dependencies...
  call npm install node-cron
  echo.
)

REM Run daemon
node sheets-monitor-daemon.js

pause
