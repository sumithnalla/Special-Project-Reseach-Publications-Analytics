@echo off
setlocal
cd /d "%~dp0"

if not exist "backend\.venv\Scripts\python.exe" (
  echo Backend dependencies are not installed yet.
  echo Run: backend\SETUP_BACKEND.bat
  pause
  exit /b 1
)

if not exist "frontend\node_modules" (
  echo Frontend dependencies are not installed yet.
  echo Run: frontend\SETUP_FRONTEND.bat
  pause
  exit /b 1
)

start "RPA Backend - http://127.0.0.1:8000" cmd.exe /k ""%~dp0backend\START_BACKEND.bat""
start "RPA Frontend - http://127.0.0.1:5173" cmd.exe /k ""%~dp0frontend\START_FRONTEND.bat""

echo.
echo Research Publication Analytics is starting.
echo.
echo Open the application: http://127.0.0.1:5173
echo API documentation:      http://127.0.0.1:8000/docs
echo.
echo Keep the two service windows open while using the application.
pause
