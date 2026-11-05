# Research Publication Analytics System

A full-stack research publication management application for synthetic faculty data. Faculty submit and track publications; administrators manage faculty, verify submissions, view MongoDB-backed analytics, download reports, and inspect audit history.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind, Recharts, Lucide
- Backend: FastAPI, PyMongo, JWT, bcrypt, ReportLab, openpyxl
- Database: MongoDB Atlas, database `research_publication_analytics`

## Architecture

```text
React/Vite -> FastAPI REST API -> PyMongo -> MongoDB Atlas
```

The five collections are `users`, `faculty_profiles`, `departments`, `publications`, and `audit_logs`. Official analytics and reports use only approved publications.

## Setup

## Quick start on Windows

After the one-time setup below, double-click `RUN_LOCAL.bat` in the project root. It starts the backend and frontend in separate command windows and prints the links:

```text
Application: http://127.0.0.1:5173
API docs:    http://127.0.0.1:8000/docs
```

For a first-time machine, run these once by double-clicking them:

```text
backend\SETUP_BACKEND.bat
frontend\SETUP_FRONTEND.bat
```

Set `MONGODB_URI` and `JWT_SECRET` in `backend\.env` after backend setup. Keep both service windows open while using the website.

## Manual setup

1. Backend environment:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `MONGODB_URI` and a unique `JWT_SECRET` in `backend/.env`. Never commit that file.

2. Initialize and seed the database using PyMongo only:

```powershell
.\.venv\Scripts\python.exe scripts/setup_database.py
.\.venv\Scripts\python.exe scripts/seed_demo_data.py
.\.venv\Scripts\python.exe scripts/verify_database.py
```

3. Start the backend:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

API documentation is at `http://127.0.0.1:8000/docs`.

4. Start the frontend:

```powershell
cd ..\frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173`.

## Demo credentials

- Admin: `sumithnalla0607@gmail.com` / `admin@123`
- Faculty: `faculty01@demo-university.edu` / `123456`

These are synthetic demonstration credentials, not production accounts.

## Verification

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -p no:cacheprovider tests -q
cd ..\frontend
npm run build
```

The database seed is idempotent. It creates 10 synthetic departments, 75 synthetic faculty profiles, and 2,500 synthetic publications without duplicating project-owned records.

## Security notes

- Passwords are bcrypt hashes.
- JWTs protect every private API path.
- Faculty access is scoped to their own profile and publications.
- Admin routes enforce the admin role server-side.
- The project uses Atlas CLI only for Atlas infrastructure inspection and PyMongo for all database work. `mongosh` is not used.
