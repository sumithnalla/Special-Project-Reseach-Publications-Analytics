@echo off
cd /d "%~dp0"

if not exist "node_modules" (
  echo Frontend dependencies are not installed yet.
  echo Run SETUP_FRONTEND.bat first.
  pause
  exit /b 1
)

echo Starting Vite frontend at http://127.0.0.1:5173
npm run dev -- --host 127.0.0.1 --port 5173
pause
