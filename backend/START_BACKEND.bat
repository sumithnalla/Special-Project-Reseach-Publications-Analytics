@echo off
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Backend dependencies are not installed yet.
  echo Run SETUP_BACKEND.bat first.
  pause
  exit /b 1
)

findstr /B /R "MONGODB_URI=mongodb" .env >nul
if errorlevel 1 (
  echo MONGODB_URI is missing from backend\.env.
  echo Add your Atlas connection string before starting the backend.
  pause
  exit /b 1
)

echo Starting FastAPI backend at http://127.0.0.1:8000
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
