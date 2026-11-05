@echo off
cd /d "%~dp0"

if not exist ".venv" python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

if not exist ".env" (
  copy .env.example .env
  echo.
  echo Created .env from .env.example.
  echo Set MONGODB_URI and JWT_SECRET in .env before running the application.
) else (
  findstr /B /R "MONGODB_URI=mongodb" .env >nul
  if errorlevel 1 (
    echo Backend packages are installed, but MONGODB_URI is missing from .env.
    echo Add your Atlas connection string before starting the application.
  ) else (
    echo Backend setup is complete.
  )
)
pause
