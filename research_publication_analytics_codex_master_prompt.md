# Research Publication Analytics System — Codex Master Build Specification

## 0. Mission

Build a complete, working, production-style B.Tech-level full-stack web application named **Research Publication Analytics System**.

This document is the **single source of truth** for the implementation. Do not ask the user to redesign the architecture unless a genuine technical blocker requires clarification. Make reasonable implementation decisions that remain consistent with this specification.

The application manages faculty research publications and gives administrators institution-level research analytics, approval workflows, dashboards, search/filtering, and downloadable reports.

The project must be realistically completable and demonstrable within approximately 3 months.

---

# 1. Current Development Environment

The user's Windows environment has already been checked:

- Windows
- MongoDB Atlas CLI: `1.58.3`
- Atlas CLI authentication: already successful
- Atlas account: `sumithnalla0607@gmail.com`
- Python: `3.13.7`
- Node.js: `v24.21.0`
- npm: `11.19.0`
- `mongosh` is NOT installed / not available on PATH.

The first task is to inspect the environment again from the terminal rather than assuming anything.

Run checks equivalent to:

```powershell
atlas --version
atlas auth whoami
atlas config describe <appropriate-profile-or-config-name-if-needed>
python --version
node --version
npm --version
mongosh --version
```

Do not fail the entire project just because `mongosh` is unavailable. Use Atlas CLI and/or PyMongo/Python scripts for database operations if necessary. If `mongosh` is genuinely required, install it only if it can be done safely and without disturbing unrelated MongoDB installations/configuration.

---

# 2. Critical MongoDB Safety Rule

## VERY IMPORTANT

This project must be completely isolated from all unrelated MongoDB resources.

**Do not modify, delete, reset, drop, rename, overwrite, or otherwise disturb any existing MongoDB Atlas project, cluster, database, collection, user, network access rule, or data unless it is explicitly created for this project.**

The Codex agent has permission to create and modify **only the resources required for this application**.

Before making destructive database operations:

1. Identify the Atlas organization/project.
2. Identify existing clusters.
3. Determine where the application should live.
4. Prefer creating a dedicated Atlas project for this application if the authenticated account permits it.
5. Prefer a dedicated cluster for this application if practical.
6. Use a clearly unique database name:
   `research_publication_analytics`
7. Never run a blanket `dropDatabase`, cluster deletion, project deletion, collection wipe, or destructive migration against an unknown/existing resource.
8. Never modify unrelated databases or collections.
9. Never delete an existing Atlas project merely to simplify setup.
10. Never modify unrelated Atlas users.
11. Never modify unrelated network access settings unless required for this application's dedicated project and explicitly safe.
12. If a required destructive action could affect an existing unrelated resource, STOP and report the conflict instead of guessing.

If the project needs cleanup during development, cleanup must be limited to resources owned by this project.

Use project-specific naming such as:

- Atlas project: `research-publication-analytics`
- Database: `research_publication_analytics`
- Collections:
  - `users`
  - `faculty_profiles`
  - `departments`
  - `publications`
  - `audit_logs`

If an existing project/cluster with those exact project-specific resources is found, inspect it first. Do not assume it is safe to erase.

---

# 3. Technology Stack — FINAL

## Frontend

- React
- Vite
- JavaScript or TypeScript; prefer **TypeScript** if setup remains straightforward
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

## Backend

- Python
- FastAPI
- Uvicorn
- PyMongo
- Pydantic / Pydantic Settings
- JWT authentication
- bcrypt-compatible password hashing
- python-dotenv or Pydantic Settings for environment configuration
- Pandas
- NumPy
- ReportLab
- openpyxl

## Database

- MongoDB Atlas
- PyMongo for application database access
- Atlas CLI for Atlas infrastructure/project operations where applicable
- `mongosh` if available; otherwise use safe Python/PyMongo scripts for collection/index/seed operations

## Architecture

```text
React + Vite + Tailwind
        |
        | REST/JSON
        v
FastAPI
        |
        | PyMongo
        v
MongoDB Atlas
```

Analytics flow:

```text
MongoDB
   |
   v
FastAPI/Python aggregation + Pandas where useful
   |
   v
JSON analytics API
   |
   v
React + Recharts
   |
   v
Interactive dashboards
```

Do NOT unnecessarily generate charts on the Python server. Charts should normally be rendered in the React frontend using Recharts.

---

# 4. Product Definition

The application is a centralized research publication management and analytics system.

It has two roles:

1. Faculty
2. Administrator

Core business flow:

```text
Faculty logs in
    |
    v
Faculty Dashboard
    |
    v
Faculty submits publication
    |
    v
Publication status = Pending
    |
    v
Administrator reviews publication
    |
    +---- Reject ----> Rejected
    |
    +---- Approve ---> Approved
                           |
                           v
                     Official analytics
```

Only approved publications are included in official institutional analytics.

Faculty can see their own publications and personal statistics.

Administrators can see institution-wide data, manage users, review publications, analyze trends, and generate reports.

---

# 5. Authentication

## Login

Use email + password.

There is NO public registration page.

Users are created by the administrator or by the seed process.

### Faculty example

```text
Email: ravi@example.com
Password: 123456
```

The dummy password may be exactly six digits for demonstration.

### Admin

The initial administrator account MUST be:

```text
Email: sumithnalla0607@gmail.com
Password: admin@123
Role: admin
```

The password MUST NOT be stored in plain text in MongoDB.

Hash passwords using bcrypt or an appropriate secure password hashing implementation.

## Important

The login credentials are demo credentials. They must be represented in documentation as demo credentials, not real production credentials.

Never expose password hashes in API responses.

---

# 6. Authentication Flow

```text
User opens Login
      |
      v
Enters email/password
      |
      v
POST /api/auth/login
      |
      v
Backend finds user by email
      |
      v
Verify password hash
      |
      v
Create JWT
      |
      v
Return token + safe user information
      |
      v
Frontend stores authentication state
      |
      v
Redirect according to role
```

Admin goes to:

```text
/admin/dashboard
```

Faculty goes to:

```text
/faculty/dashboard
```

Use protected frontend routes.

Also enforce authorization in the backend.

Never rely only on frontend route hiding for security.

---

# 7. Role-Based Access Control

## Faculty

Faculty can:

- Login
- Logout
- View own dashboard
- View own profile
- Edit allowed profile fields
- Add publications
- View own publications
- Edit own publications
- Delete own publications
- Search/filter own publications
- View own research analytics

Faculty cannot:

- View other faculty's private records
- View institution-wide admin analytics
- Approve/reject publications
- Manage users
- Access audit logs
- Delete other faculty's publications
- Access admin APIs

## Admin

Admin can:

- Login
- Logout
- View admin dashboard
- View all faculty
- Create faculty accounts
- Edit faculty accounts
- Activate/deactivate faculty accounts
- View all publications
- Search/filter all publications
- Edit publications
- Delete publications
- Review pending publications
- Approve publications
- Reject publications
- View institution analytics
- View department analytics
- View faculty analytics
- Generate PDF reports
- Export Excel reports
- View audit logs
- Manage own admin profile where appropriate

---

# 8. MongoDB Data Model

MongoDB uses databases, collections, and documents rather than SQL tables.

Database:

```text
research_publication_analytics
```

Collections:

```text
users
faculty_profiles
departments
publications
audit_logs
```

Do not create unnecessary collections unless technically justified.

---

# 9. Users Collection

Suggested document:

```json
{
  "_id": "ObjectId",
  "email": "ravi@example.com",
  "password_hash": "...",
  "role": "faculty",
  "status": "active",
  "created_at": "datetime",
  "updated_at": "datetime",
  "last_login": "datetime|null"
}
```

Allowed roles:

```text
admin
faculty
```

Allowed status:

```text
active
inactive
```

Create a unique index on email.

Emails should be normalized to lowercase.

---

# 10. Faculty Profiles Collection

Suggested document:

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "faculty_id": "FAC001",
  "name": "Dr. Ravi Kumar",
  "department_id": "ObjectId",
  "designation": "Associate Professor",
  "research_areas": [
    "Artificial Intelligence",
    "Machine Learning"
  ],
  "joining_year": 2018,
  "phone": "",
  "profile_image": null,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Create appropriate indexes on:

- user_id
- faculty_id
- department_id

---

# 11. Departments Collection

Example:

```json
{
  "_id": "ObjectId",
  "name": "Computer Science and Engineering",
  "code": "CSE",
  "status": "active"
}
```

Create realistic departments such as:

- CSE
- ECE
- EEE
- Mechanical Engineering
- Civil Engineering
- Information Technology
- AI & Data Science
- Physics
- Mathematics
- MBA

Do not create departments that imply a real institution unless clearly marked as synthetic/demo data.

---

# 12. Publications Collection

This is the central collection.

Suggested document:

```json
{
  "_id": "ObjectId",
  "faculty_id": "ObjectId",
  "title": "Synthetic Research Publication Title",
  "authors": [
    "Dr. Ravi Kumar",
    "Dr. Priya Sharma"
  ],
  "publication_type": "journal",
  "journal_or_conference": "International Journal of Artificial Intelligence",
  "publisher": "Synthetic Publisher",
  "publication_year": 2025,
  "doi": "10.0000/example.2025.001",
  "indexing": "Scopus",
  "quartile": "Q2",
  "impact_factor": 4.2,
  "citation_count": 18,
  "url": "",
  "abstract": "Synthetic demonstration abstract.",
  "status": "pending",
  "submitted_at": "datetime",
  "verified_at": null,
  "verified_by": null,
  "rejection_reason": null,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Allowed publication types:

- journal
- conference
- book_chapter

Allowed indexing values:

- Scopus
- Web of Science
- UGC/Other
- Not Indexed

Allowed quartiles:

- Q1
- Q2
- Q3
- Q4
- N/A

Allowed statuses:

- pending
- approved
- rejected

Create useful indexes for:

- faculty_id
- publication_year
- status
- publication_type
- indexing
- department-related lookup strategy
- submitted_at

Use compound indexes where useful after reviewing actual query patterns.

---

# 13. Audit Logs Collection

Suggested document:

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "action": "APPROVE_PUBLICATION",
  "entity_type": "publication",
  "entity_id": "ObjectId",
  "timestamp": "datetime",
  "details": {
    "title": "..."
  }
}
```

Log important administrative and mutation operations such as:

- login
- logout if practical
- create faculty
- deactivate faculty
- create publication
- update publication
- delete publication
- approve publication
- reject publication
- report generation

Never log passwords or password hashes.

---

# 14. Dummy Data Requirements

The application MUST ship with a substantial synthetic/demo dataset.

Target approximately:

- 75 faculty members
- 10 departments
- 2,500 publications

If hardware/Atlas limits make this excessive, use at least:

- 50 faculty
- 8 departments
- 1,000 publications

The data must look realistic but MUST be clearly synthetic.

Use names such as:

- Dr. Arjun Rao
- Dr. Priya Sharma
- Dr. Kiran Reddy

but do not imply these are actual faculty of a real institution.

Use synthetic email domains such as:

```text
example.edu
demo-university.edu
```

or another clearly fictional domain.

Use realistic distributions for:

- publication years: 2020–2026
- journal/conference/book chapter
- Scopus/Web of Science/other/not indexed
- Q1/Q2/Q3/Q4/N/A
- citations
- impact factors
- departments
- research areas

Do not make every record identical or uniformly random.

Create varied, plausible synthetic distributions so charts look meaningful.

The seed data should include a mixture of:

- approved publications
- pending publications
- rejected publications

Ensure enough approved publications exist for analytics to be meaningful.

---

# 15. Seeded Admin

Create exactly one intended initial admin account:

```text
email: sumithnalla0607@gmail.com
password: admin@123
role: admin
status: active
```

Hash the password before storing it.

Do not create duplicate admin accounts every time the seed script runs.

Make seeding idempotent.

If the account already exists, update only the fields that are explicitly owned by the project seed process and do not destroy unrelated users.

---

# 16. Faculty Account Creation

Admin has:

```text
Faculty Management
    |
    +-- Add Faculty
```

Form fields:

- Name
- Email
- Faculty ID
- Department
- Designation
- Research Areas
- Joining Year
- Temporary Password

The backend should create:

1. A user document
2. A faculty profile document

with the appropriate relationship.

Use transactions only if supported/configured appropriately; otherwise implement safe compensation/error handling.

Do not expose password hashes.

---

# 17. Faculty Dashboard

After faculty login, show:

```text
Welcome, Dr. <Name>
```

Summary cards:

- Total Publications
- Journal Publications
- Conference Publications
- Scopus Publications
- Total Citations

Only approved publications should count toward official statistics.

Show:

### Publication Trend

Line chart by year.

### Publication Type

Donut/pie chart.

### Indexing Distribution

Bar/donut chart.

### Recent Publications

Table showing recent publications and status.

Navigation:

```text
Dashboard
My Profile
My Publications
Analytics
Logout
```

---

# 18. Faculty Profile

Display:

- Name
- Faculty ID
- Email
- Department
- Designation
- Joining Year
- Research Areas

Allow editing only fields that faculty are permitted to edit.

Do not allow faculty to change their role.

Do not allow faculty to modify authentication internals.

---

# 19. Faculty Publications

Provide:

```text
My Publications
```

with:

- Search
- Filter by year
- Filter by type
- Filter by indexing
- Filter by status
- Pagination

Columns:

- Title
- Year
- Type
- Journal/Conference
- Indexing
- Citations
- Status
- Actions

Actions:

```text
View
Edit
Delete
```

Faculty may only manipulate their own records.

---

# 20. Add Publication Form

Fields:

- Publication title
- Authors
- Publication type
- Journal/Conference name
- Publisher
- Publication year
- DOI
- Indexing
- Quartile
- Impact factor
- Citation count
- URL
- Abstract

Validation:

- title required
- publication type required
- publication year valid
- citation count non-negative
- impact factor non-negative
- URL valid if supplied
- DOI format reasonable if supplied
- authors must contain at least one author

On submission:

```text
status = pending
```

Show a success message.

---

# 21. Publication Approval

Admin has:

```text
Pending Approvals
```

Display:

- Faculty
- Publication title
- Type
- Year
- Indexing
- Submitted date
- Status
- Actions

Actions:

```text
View
Approve
Reject
```

Approve:

```text
status = approved
verified_at = current datetime
verified_by = admin user ID
```

Reject:

```text
status = rejected
rejection_reason = admin supplied reason
verified_at = current datetime
verified_by = admin user ID
```

A rejected publication can be edited and resubmitted by faculty if desired.

If resubmitted, set status back to pending.

---

# 22. Admin Dashboard

Admin dashboard should contain:

### KPI cards

- Total Faculty
- Total Publications
- Approved Publications
- Pending Publications
- Rejected Publications
- Total Citations
- Scopus Publications
- Web of Science Publications

### Charts

1. Publications by Year
2. Publications by Department
3. Publications by Type
4. Publications by Indexing
5. Citations by Year
6. Faculty Publication Distribution

Only approved publications should contribute to official research analytics unless a chart explicitly indicates otherwise.

---

# 23. Admin Faculty Management

Page:

```text
Faculty
```

Features:

- Search faculty
- Filter department
- Filter status
- Pagination
- Add faculty
- View faculty
- Edit faculty
- Activate/deactivate faculty

Table:

```text
Faculty ID
Name
Email
Department
Designation
Publication Count
Status
Actions
```

Admin may view a faculty member's research profile and publications.

---

# 24. Admin Publication Management

Page:

```text
Publications
```

Features:

- Search title
- Search author
- Filter year
- Filter department
- Filter type
- Filter indexing
- Filter quartile
- Filter status
- Pagination

Admin may:

- View
- Edit
- Delete
- Approve
- Reject

Every administrative mutation should generate an audit log.

---

# 25. Analytics

The application must provide useful research analytics rather than merely displaying database records.

## Institution analytics

- Total approved publications
- Publications by year
- Publications by department
- Publications by type
- Publications by indexing
- Publications by quartile
- Citations by year
- Average citations per publication
- Faculty publication distribution

## Faculty analytics

For a selected faculty:

- Total approved publications
- Publications by year
- Publications by type
- Indexing distribution
- Quartile distribution
- Total citations
- Average citations

## Department analytics

For selected department:

- Total publications
- Publications by year
- Publication types
- Indexing
- Quartiles
- Total citations
- Faculty contribution distribution

Provide filters:

- Year
- Department
- Faculty
- Publication type
- Indexing
- Quartile

Do not hard-code analytics.

Every chart must derive from database data through backend APIs.

---

# 26. Analytics API Design

Create clean REST endpoints, for example:

```text
POST /api/auth/login
GET  /api/auth/me

GET  /api/faculty/dashboard
GET  /api/faculty/profile
PUT  /api/faculty/profile

GET  /api/faculty/publications
POST /api/faculty/publications
GET  /api/faculty/publications/{id}
PUT  /api/faculty/publications/{id}
DELETE /api/faculty/publications/{id}

GET  /api/faculty/analytics

GET  /api/admin/dashboard
GET  /api/admin/faculty
POST /api/admin/faculty
GET  /api/admin/faculty/{id}
PUT  /api/admin/faculty/{id}
PATCH /api/admin/faculty/{id}/status

GET  /api/admin/publications
GET  /api/admin/publications/{id}
PUT  /api/admin/publications/{id}
DELETE /api/admin/publications/{id}

GET  /api/admin/publications/pending
PATCH /api/admin/publications/{id}/approve
PATCH /api/admin/publications/{id}/reject

GET  /api/admin/analytics/overview
GET  /api/admin/analytics/yearly
GET  /api/admin/analytics/departments
GET  /api/admin/analytics/types
GET  /api/admin/analytics/indexing
GET  /api/admin/analytics/citations
GET  /api/admin/analytics/faculty

GET  /api/admin/reports/publications/pdf
GET  /api/admin/reports/publications/excel

GET  /api/admin/audit-logs
```

Adapt names if necessary, but maintain clear REST semantics.

---

# 27. API Rules

Every protected endpoint must validate the JWT.

Role-sensitive endpoints must enforce role server-side.

Faculty publication endpoints must verify ownership:

```text
publication.faculty_id == authenticated_faculty_id
```

Admin endpoints require:

```text
role == admin
```

Never trust faculty_id supplied by the frontend.

For faculty publication creation, derive faculty_id from the authenticated user rather than accepting arbitrary faculty_id from the client.

---

# 28. Frontend Pages

## Public

```text
/login
```

No public registration.

## Faculty

```text
/faculty/dashboard
/faculty/profile
/faculty/publications
/faculty/publications/new
/faculty/publications/:id
/faculty/analytics
```

## Admin

```text
/admin/dashboard
/admin/faculty
/admin/faculty/:id
/admin/publications
/admin/publications/pending
/admin/analytics
/admin/reports
/admin/audit-logs
/admin/profile
```

---

# 29. UI Requirements

Design should be:

- Clean
- Professional
- Modern
- Simple enough for a B.Tech project
- Responsive
- Desktop-first but mobile-friendly
- Consistent
- Easy to demonstrate

Avoid:

- Excessive animations
- Huge gradients
- Overly complex design
- Unnecessary UI libraries
- Excessive modal nesting
- Decorative features that don't support the project

Use:

- Sidebar navigation
- Top bar
- Cards
- Tables
- Filters
- Search
- Charts
- Clear status badges
- Toast notifications
- Loading states
- Empty states
- Error states
- Confirmation dialogs for destructive actions

---

# 30. Status Colors and Meaning

Use clear semantic UI states:

```text
Approved  -> success
Pending   -> warning
Rejected  -> error
Active    -> success
Inactive  -> neutral/error
```

Do not rely on color alone; include text labels/icons where useful.

---

# 31. Reports

Admin should be able to generate:

## PDF

Report title:

```text
Research Publication Analytics Report
```

Include:

- Report generation date
- Selected filters
- Total publications
- Department summary
- Year summary
- Publication type summary
- Indexing summary
- Citation summary
- Faculty publication summary

Use ReportLab.

## Excel

Use openpyxl.

Create useful worksheets such as:

```text
Summary
Publications
Faculty Summary
Department Summary
Yearly Summary
```

Only include appropriate approved publications for official reports unless the report explicitly requests another status.

---

# 32. Data Visualization

Use Recharts in React.

Required chart types can include:

- Line chart
- Bar chart
- Pie/donut chart
- Horizontal bar chart

Minimum useful charts:

Faculty dashboard:
- publications by year
- publication type distribution

Admin dashboard:
- publications by year
- publications by department
- indexing distribution
- faculty publication distribution
- citations by year

Charts must have:

- titles
- legends where useful
- tooltips
- readable axes
- empty-state handling

---

# 33. Search, Filtering, Pagination

Do not load thousands of records into the browser unnecessarily.

For large publication tables:

- Use backend pagination.
- Use backend filtering.
- Use backend search.
- Return total count and pagination metadata.

Example response:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 2500,
  "total_pages": 125
}
```

Use MongoDB indexes to support common filters.

---

# 34. Validation

Validate on BOTH frontend and backend.

Frontend provides friendly immediate validation.

Backend is authoritative.

Never trust frontend validation.

Handle:

- invalid email
- duplicate email
- duplicate faculty ID
- invalid publication year
- negative citations
- negative impact factor
- malformed URL
- invalid enum values
- missing required fields
- unauthorized record access

---

# 35. Error Handling

Backend should return structured errors.

Frontend should display user-friendly messages.

Do not expose:

- stack traces
- MongoDB connection strings
- password hashes
- internal secrets
- JWT secrets

to users.

---

# 36. Environment Variables

Create `.env.example`.

Backend variables should include concepts such as:

```text
MONGODB_URI=
MONGODB_DATABASE=research_publication_analytics
JWT_SECRET=
JWT_EXPIRE_MINUTES=
CORS_ORIGINS=
```

Do NOT commit the actual MongoDB URI or JWT secret to Git.

Create `.gitignore` for:

```text
.env
.venv
__pycache__
node_modules
dist
*.pyc
```

If a real Atlas connection string already exists in the user's environment, do not print it unnecessarily.

---

# 37. Database Connection

Use a single reusable MongoDB client per backend process rather than opening a new connection for every request.

Create a clear database module.

Example conceptual structure:

```text
backend/
  app/
    core/
      config.py
      security.py
    db/
      mongodb.py
    models/
    schemas/
    routers/
    services/
    analytics/
    reports/
```

Use connection lifecycle handling with FastAPI lifespan/startup/shutdown patterns appropriate to the installed FastAPI version.

---

# 38. Backend Project Structure

Use a maintainable structure similar to:

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── dependencies.py
│   ├── db/
│   │   ├── mongodb.py
│   │   └── indexes.py
│   ├── models/
│   ├── schemas/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── faculty.py
│   │   ├── publications.py
│   │   ├── admin.py
│   │   ├── analytics.py
│   │   └── reports.py
│   ├── services/
│   ├── analytics/
│   └── reports/
├── scripts/
│   ├── setup_database.py
│   ├── seed_departments.py
│   ├── seed_admin.py
│   └── seed_demo_data.py
├── requirements.txt
├── .env.example
└── README.md
```

Adjust names if a better clean structure is appropriate.

---

# 39. Frontend Project Structure

Use a structure similar to:

```text
frontend/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── auth/
│   │   ├── faculty/
│   │   └── admin/
│   ├── routes/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
└── vite.config.ts
```

Keep components reusable.

---

# 40. Authentication Storage

Use a secure and practical JWT strategy.

For a B.Tech demonstration, choose a consistent implementation and document it.

Prefer an HttpOnly cookie-based access token if the implementation remains straightforward.

If using browser storage instead, document the tradeoff and keep token handling centralized.

Never put passwords in frontend state longer than necessary.

Never send password hashes to the frontend.

---

# 41. Security Requirements

Implement:

- password hashing
- JWT authentication
- role-based authorization
- ownership checks
- input validation
- CORS configuration
- environment secrets
- no plaintext passwords
- no sensitive logging
- rate limiting only if practical and not disruptive
- safe error messages

Use appropriate HTTP status codes:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

---

# 42. Database Indexing

At minimum consider:

```text
users.email UNIQUE

faculty_profiles.user_id
faculty_profiles.faculty_id UNIQUE
faculty_profiles.department_id

publications.faculty_id
publications.publication_year
publications.status
publications.publication_type
publications.indexing
publications.submitted_at

audit_logs.user_id
audit_logs.timestamp
```

Add compound indexes after considering real query patterns.

Do not create dozens of unnecessary indexes.

---

# 43. Database Setup Scripts

Codex must create safe, repeatable scripts for:

1. Database connection validation
2. Collection initialization
3. Index creation
4. Department seeding
5. Admin seeding
6. Faculty demo-data seeding
7. Publication demo-data seeding

Scripts must be idempotent where practical.

Running:

```powershell
python scripts/setup_database.py
```

twice must not duplicate everything.

Running:

```powershell
python scripts/seed_demo_data.py
```

twice should detect existing seed/demo records or use a controlled reset only for project-owned synthetic data.

Never wipe unrelated MongoDB data.

---

# 44. MongoDB Atlas CLI Requirements

Use Atlas CLI to inspect the authenticated environment first.

Do not assume a particular Atlas organization/project/cluster exists.

Inspect safely.

If creating a dedicated Atlas project is permitted and appropriate, use one.

If a dedicated cluster is needed and the account's current plan permits it, create one.

If the user already has an appropriate project/cluster that can safely host this application, reuse it only if the database/collections can remain isolated.

The application database must be:

```text
research_publication_analytics
```

Do not create generic databases such as:

```text
test
demo
mydb
database1
```

unless temporarily required and clearly removed afterward.

---

# 45. No Manual MongoDB Work Requirement

The user wants Codex to handle project database setup from the terminal.

Therefore:

- Do not instruct the user to manually create collections in Atlas UI.
- Do not require manual insertion of documents.
- Do not require manual creation of dummy data.
- Do not rely on MongoDB Compass.
- Use terminal commands/scripts.

The user may view the data in Atlas UI if desired, but setup must be reproducible from the terminal.

---

# 46. Don't Touch Unrelated MongoDB

This is repeated intentionally.

Codex MUST NOT:

```text
drop all databases
drop all collections
delete all users
delete the Atlas project
delete the Atlas cluster
reset Atlas networking globally
modify unrelated connection settings
```

Do not run dangerous commands such as broad database resets without a precise project-specific target.

If a cleanup is needed, it must target only:

```text
research_publication_analytics
```

inside the dedicated project/cluster/database that belongs to this application.

---

# 47. Synthetic Data Generator

Build a deterministic-ish generator where useful.

Use realistic combinations.

Example:

```text
publication_year
publication_type
indexing
quartile
citation_count
impact_factor
department
faculty
```

Avoid impossible combinations where reasonable.

Examples:

- Non-indexed publications should generally use quartile N/A.
- Conference publications may have N/A impact factor where appropriate.
- Older publications generally have the opportunity to have more citations than very recent publications.
- Citation counts should vary.
- Q1/Q2 should not dominate unrealistically.
- Not every faculty member should have the same publication count.

Use a fixed random seed if reproducibility is useful.

---

# 48. Demo Accounts

Seed faculty demo accounts.

Example pattern:

```text
ravi01@example.edu
priya02@example.edu
arjun03@example.edu
```

Passwords may be:

```text
123456
```

for synthetic demo users.

Document clearly in README that these are demo accounts.

Do not use real people's email addresses.

---

# 49. Faculty Dashboard Business Logic

When faculty opens dashboard:

1. Identify authenticated user.
2. Resolve faculty profile.
3. Query approved publications belonging to that faculty.
4. Calculate:
   - total publications
   - journal count
   - conference count
   - Scopus count
   - citation total
5. Generate yearly/type/indexing distributions.
6. Return data.
7. Render cards and charts.

Pending and rejected publications may be shown in a separate status summary but must not inflate official approved-publication metrics.

---

# 50. Admin Dashboard Business Logic

When admin opens dashboard:

1. Count active faculty.
2. Count all publications by status.
3. Count approved publications.
4. Aggregate approved publication counts by year.
5. Aggregate approved publications by department.
6. Aggregate by publication type.
7. Aggregate by indexing.
8. Sum citations.
9. Calculate useful derived metrics.
10. Return compact analytics JSON.

Do not fetch all 2,500 publications into Python just to count them if MongoDB aggregation can efficiently perform the calculation.

Use MongoDB aggregation pipelines for database-side aggregation where appropriate.

Use Pandas when it genuinely simplifies complex report/analytics processing.

---

# 51. Analytics Definitions

Document the definitions clearly.

### Total Publications

Number of approved publication documents.

### Journal Publications

Approved publications where:

```text
publication_type == journal
```

### Conference Publications

Approved publications where:

```text
publication_type == conference
```

### Scopus Publications

Approved publications where:

```text
indexing == Scopus
```

### Total Citations

Sum of citation_count across approved publications.

### Average Citations

```text
total citations / approved publication count
```

Handle division by zero.

### Yearly Publications

Count of approved publications grouped by publication_year.

---

# 52. Reports Must Respect Filters

If admin chooses:

```text
Department = CSE
Year = 2025
Indexing = Scopus
```

the report must contain data matching those filters.

Do not generate a report that ignores selected filters.

---

# 53. UX Details

Add:

- Loading skeleton/spinner where appropriate
- Toast on successful create/update/delete
- Confirmation before delete
- Confirmation before rejecting/approving where useful
- Empty states
- Error states
- Pagination controls
- Search debounce if useful
- Accessible form labels
- Keyboard-friendly forms
- Responsive tables with horizontal scrolling on small screens

---

# 54. No Unnecessary Features

Do NOT add:

- Chat system
- Social feed
- Messaging
- Payments
- AI chatbot
- Real-time notifications
- Complex microservices
- Docker/Kubernetes unless needed
- Mobile application
- Google OAuth
- SMS OTP
- Email verification service
- External publication scraping

These are outside the 3-month project scope.

---

# 55. Optional Advanced Features

Only implement these after all core features are complete:

- DOI metadata lookup
- CSV import
- CSV export
- Advanced report filtering
- Profile image upload
- Publication attachment upload
- Password reset workflow

Do not let optional features delay the core application.

---

# 56. Testing

The finished project must be tested.

## Backend

Test:

- login success
- invalid login
- inactive user login rejection
- faculty cannot access admin endpoint
- admin can access admin endpoint
- faculty can create own publication
- faculty cannot modify another faculty's publication
- admin can modify any publication
- approval workflow
- rejection workflow
- duplicate email
- validation errors
- analytics calculations

## Frontend

Test manually or with suitable automated tests:

- login
- role redirect
- faculty dashboard
- admin dashboard
- add publication
- edit publication
- delete publication
- approval
- filtering
- pagination
- reports

## Database

Verify:

- indexes
- seeded admin
- seeded departments
- seeded faculty
- seeded publications
- no duplicate admin after rerunning seed
- no duplicate faculty when seed is rerun
- no unrelated MongoDB data was modified

---

# 57. Acceptance Tests

The application is considered complete only if all of these work:

### Authentication

- Admin can log in with:
  `sumithnalla0607@gmail.com / admin@123`
- Faculty can log in using a seeded demo account.
- Invalid passwords fail.
- Role-based redirects work.
- Unauthorized routes are blocked.

### Faculty

- Faculty dashboard loads.
- Faculty profile loads.
- Faculty can add publication.
- Publication starts as pending.
- Faculty can view their publication.
- Faculty can edit it.
- Faculty can delete it.
- Faculty cannot access another faculty's publication.
- Faculty analytics work.

### Admin

- Admin dashboard loads.
- Admin sees institution statistics.
- Admin can view faculty.
- Admin can create faculty.
- Admin can deactivate faculty.
- Admin can view all publications.
- Admin can filter publications.
- Admin can approve publications.
- Admin can reject publications.
- Admin analytics work.
- Reports download successfully.
- Audit logs are visible.

### Database

- MongoDB Atlas connection works.
- Correct collections exist.
- Indexes exist.
- Seed data exists.
- No duplicate seed explosion occurs.

---

# 58. README Requirements

Create a complete README containing:

## Project title

Research Publication Analytics System

## Description

Short project explanation.

## Features

Faculty features and admin features.

## Tech stack

Frontend/backend/database/tools.

## Architecture

Explain frontend → backend → MongoDB.

## Prerequisites

- Python
- Node.js
- npm
- MongoDB Atlas CLI
- Atlas authentication

## Setup

Exact commands.

## Environment variables

Explain `.env`.

Never put the actual MongoDB URI or JWT secret into README.

## Database setup

Exact terminal commands.

## Seed data

Exact commands.

## Run backend

Exact command.

## Run frontend

Exact command.

## Demo credentials

Admin:

```text
Email: sumithnalla0607@gmail.com
Password: admin@123
```

Also include synthetic faculty demo credentials.

## API documentation

Mention FastAPI Swagger endpoint, normally:

```text
/docs
```

## Project structure

Explain important folders.

## Security notes

Explain password hashing, JWT, role authorization.

---

# 59. API Documentation

FastAPI should expose OpenAPI/Swagger documentation.

Ensure:

```text
/docs
/redoc
```

work.

Use Pydantic schemas with useful field descriptions.

---

# 60. Code Quality

Code should be:

- readable
- modular
- documented where needed
- typed where practical
- free of unnecessary duplication
- easy for B.Tech students to understand

Do not create enormous single files.

Do not put all backend logic in `main.py`.

Do not put all frontend code in `App.tsx`.

Separate:

- routes
- services
- database
- authentication
- schemas
- analytics
- reports
- components
- pages

---

# 61. Configuration and Secrets

Never hardcode:

```text
MONGODB_URI
JWT_SECRET
```

The admin demo password may be used by the seed process because it is explicitly part of the project specification, but store the resulting password only as a hash.

If a seed script contains a demo password, clearly mark it as a development/demo credential.

Do not commit `.env`.

Create `.env.example`.

---

# 62. Development Commands

Provide a simple workflow.

Backend example:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/setup_database.py
python scripts/seed_demo_data.py
uvicorn app.main:app --reload
```

Frontend example:

```powershell
cd frontend
npm install
npm run dev
```

Adapt exact commands to the final implementation.

---

# 63. CORS

Configure backend CORS to allow the local frontend development origin, normally:

```text
http://localhost:5173
```

Do not use unrestricted wildcard CORS in the final configuration unless there is a documented reason.

Make CORS configurable through environment variables.

---

# 64. Frontend API Configuration

Do not hardcode API URLs throughout components.

Use one API configuration.

For Vite, use an environment variable such as:

```text
VITE_API_BASE_URL=http://localhost:8000/api
```

Create `.env.example`.

---

# 65. No Fake Analytics

Do not hardcode:

```text
Total Publications = 542
```

or similar numbers into the dashboard.

All KPI cards and charts must come from real MongoDB data.

The dummy data is the source of the numbers.

If the database is empty, the dashboard must show a meaningful empty state rather than invented values.

---

# 66. No Fake Buttons

Every visible button must either:

- perform its intended action,
- navigate to a real implemented page,
- or be clearly marked as disabled/unavailable.

Do not create decorative buttons that do nothing.

---

# 67. No Placeholder Screens

Do not leave:

```text
Coming Soon
TODO
Lorem ipsum
Sample chart
```

in core screens.

Core screens must be functional.

---

# 68. Implementation Strategy

Do NOT attempt a giant uncontrolled code dump.

Work in phases.

## Phase 1 — Inspect environment

Check:

- Atlas CLI
- authentication
- Python
- Node
- npm
- mongosh

Inspect Atlas safely.

## Phase 2 — Plan repository

Create:

```text
backend/
frontend/
```

and supporting files.

## Phase 3 — Atlas/database setup

Create or identify isolated project resources.

Create:

```text
research_publication_analytics
```

and required collections/indexes.

## Phase 4 — Database seed

Create:

- departments
- admin
- faculty
- publications

## Phase 5 — Backend foundation

Implement:

- FastAPI
- settings
- database connection
- authentication
- JWT
- RBAC
- schemas
- error handling

## Phase 6 — Faculty APIs

Implement:

- profile
- publications
- faculty analytics

## Phase 7 — Admin APIs

Implement:

- faculty management
- publication management
- approvals
- admin analytics
- audit logs

## Phase 8 — Reports

Implement:

- PDF
- Excel

## Phase 9 — Frontend foundation

Implement:

- routing
- login
- layouts
- authentication state
- API client
- sidebar

## Phase 10 — Faculty UI

Implement all faculty pages.

## Phase 11 — Admin UI

Implement all admin pages.

## Phase 12 — Analytics UI

Implement charts and filters.

## Phase 13 — Testing

Run backend/frontend tests and manual flows.

## Phase 14 — Polish

Fix:

- UI bugs
- validation
- loading states
- empty states
- responsive behavior
- API errors

## Phase 15 — Final verification

Run through the acceptance checklist.

---

# 69. How Codex Should Work

Codex should behave like a senior full-stack engineer.

Before creating files:

1. Inspect the current directory.
2. Determine whether a project already exists.
3. Do not blindly overwrite unrelated files.
4. Inspect Atlas authentication.
5. Identify safe project resources.
6. Build incrementally.

After each major phase:

- run relevant tests
- run build
- fix errors
- continue only when the previous phase works

Do not claim something works without testing it.

If a command fails, diagnose it.

Do not silently skip failed setup.

---

# 70. Windows Compatibility

The user's machine is Windows.

Commands and scripts must work on Windows PowerShell/CMD.

Avoid assuming Linux-only commands such as:

```bash
rm -rf
chmod
export
```

unless providing a Windows-compatible equivalent.

Python virtual environment activation should work with Windows.

npm commands must work in Windows.

---

# 71. Existing Files

Before modifying existing files:

- inspect them
- preserve unrelated work
- avoid destructive overwrites

If an existing project is detected, integrate carefully or create the application in a dedicated project directory.

Do not delete unrelated source code.

---

# 72. Git

If Git is available, initialize/use it if appropriate.

Create a useful `.gitignore`.

Never commit:

- `.env`
- secrets
- MongoDB URI
- JWT secret
- generated caches
- node_modules
- virtual environments

---

# 73. Performance

For the target synthetic dataset:

- use pagination
- use MongoDB indexes
- aggregate in MongoDB where appropriate
- don't return huge documents unnecessarily
- don't fetch all publications for simple counts
- don't load thousands of records into the browser
- use summary endpoints for dashboard cards/charts

---

# 74. Accessibility

Use:

- semantic HTML
- labels
- keyboard-accessible controls
- visible focus states
- accessible buttons
- appropriate aria labels when needed
- sufficient text contrast

---

# 75. Responsive Design

Desktop is the primary demonstration environment.

Still ensure reasonable behavior at:

- 1280px
- 1024px
- 768px
- mobile widths

Tables may scroll horizontally on small screens.

Sidebar should collapse appropriately.

---

# 76. Project Naming

Use:

```text
research-publication-analytics-system
```

for the application/repository if appropriate.

Frontend:

```text
frontend
```

Backend:

```text
backend
```

Database:

```text
research_publication_analytics
```

---

# 77. Final User Experience

The final demo should feel like this:

## Faculty

```text
Login
 ↓
Dashboard
 ↓
See research statistics
 ↓
Add publication
 ↓
Publication becomes Pending
 ↓
View publication status
 ↓
Admin approves
 ↓
Dashboard statistics update
 ↓
Publication appears in approved analytics
```

## Admin

```text
Login
 ↓
Institution dashboard
 ↓
See faculty/publication/citation KPIs
 ↓
Review pending publications
 ↓
Approve/reject
 ↓
Manage faculty
 ↓
Search/filter publications
 ↓
View analytics
 ↓
Generate PDF/Excel report
 ↓
View audit logs
```

---

# 78. Final Acceptance Condition

Do not consider the project complete merely because:

- files exist
- frontend starts
- backend starts
- MongoDB connects

It is complete only when a realistic end-to-end workflow works:

```text
Admin login
    ↓
Faculty account exists
    ↓
Faculty login
    ↓
Faculty adds publication
    ↓
Publication stored in MongoDB
    ↓
Status = pending
    ↓
Admin sees pending publication
    ↓
Admin approves
    ↓
Status = approved
    ↓
Analytics update
    ↓
Charts update
    ↓
Report includes publication
    ↓
Audit log records important actions
```

Also verify:

```text
Faculty A cannot edit Faculty B's publication.
Faculty cannot access admin endpoints.
Inactive faculty cannot log in.
Admin can manage faculty.
Database seed can be rerun safely.
Unrelated MongoDB resources remain untouched.
```

---

# 79. Final Instruction to Codex

Build this application completely.

Do not replace required functionality with mockups.

Do not create fake analytics.

Do not hardcode dashboard statistics.

Do not skip backend authorization.

Do not store plaintext passwords.

Do not require manual database setup in the Atlas UI.

Do not touch unrelated MongoDB resources.

Use terminal-driven Atlas/database setup.

Use the MongoDB database:

```text
research_publication_analytics
```

Use synthetic data for demonstration.

Keep the implementation understandable enough for B.Tech students to study, explain, demonstrate, and defend in a project viva.

At the end, provide:

1. Final folder structure
2. Setup commands
3. Run commands
4. Database setup commands
5. Seed commands
6. Demo credentials
7. API documentation location
8. Testing results
9. Any remaining limitations
10. Short explanation of the architecture
11. Short explanation of the database collections
12. Short explanation of the faculty workflow
13. Short explanation of the admin workflow

Do not stop after scaffolding.

Continue until the core application is actually implemented and verified.
