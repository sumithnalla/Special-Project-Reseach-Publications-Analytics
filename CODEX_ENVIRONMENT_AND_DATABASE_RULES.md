# Codex Environment & MongoDB Atlas Rules (Highest Priority)

## IMPORTANT — Read this before doing anything

This document overrides any default assumptions about MongoDB setup.

---

# 1. Development Environment

The development machine is Windows.

Verified tools available:

* MongoDB Atlas CLI is installed and authenticated.
* Python 3.13.7
* Node.js 24.x
* npm 11.x

**MongoDB Shell (`mongosh`) is NOT installed and MUST NOT be used.**

Do not attempt to install `mongosh`.

---

# 2. MongoDB Strategy (MANDATORY)

Use **MongoDB Atlas CLI + PyMongo ONLY**.

### Use Atlas CLI for

* Checking authentication.
* Reading Atlas projects.
* Reading clusters.
* Reading connection information if needed.

### Use PyMongo for

* Connecting to MongoDB Atlas.
* Creating the application database.
* Creating collections.
* Creating indexes.
* Seeding data.
* CRUD operations.
* Aggregation pipelines.

Do not use `mongosh`.

Do not generate instructions requiring `mongosh`.

---

# 3. Atlas Account

Authenticated Atlas account:

`sumithnalla0607@gmail.com`

Before starting, verify:

```powershell
atlas auth whoami
```

If authentication expires, use:

```powershell
atlas auth login --noBrowser
```

---

# 4. Atlas Project to Use

Use **ONLY** this Atlas project.

Project Name:

`Project 0`

Project ID:

`68306879f90e344aa985d26e`

All MongoDB resources for this application must live inside this project.

Never use any other Atlas project unless explicitly instructed.

---

# 5. Existing Atlas Projects (DO NOT TOUCH)

The Atlas account contains multiple projects.

Known existing project:

`SpotifyClone`

**This project is unrelated.**

Never:

* modify it,
* delete it,
* create collections in it,
* drop databases in it,
* read/write its data,
* change cluster configuration.

Treat it as read-only and out of scope.

---

# 6. Database Name

Create exactly one database for this application:

`research_publication_analytics`

Do not create generic databases like:

* test
* demo
* database
* mydb
* sample

Everything belongs inside `research_publication_analytics`.

---

# 7. Collections to Create

Create only these collections:

* users
* faculty_profiles
* departments
* publications
* audit_logs

No additional collections unless genuinely required.

---

# 8. Connection Handling

Use PyMongo.

Create a reusable MongoDB client inside the backend.

Use environment variables.

Never hardcode the MongoDB Atlas URI.

Use `.env` for secrets.

Create `.env.example`.

---

# 9. Database Initialization

Create Python scripts inside:

```text
backend/scripts/
```

Required scripts:

* setup_database.py
* seed_departments.py
* seed_admin.py
* seed_demo_data.py

Running:

```powershell
python scripts/setup_database.py
```

must:

* connect to Atlas,
* create the database,
* create collections,
* create indexes,
* verify everything.

Running:

```powershell
python scripts/seed_demo_data.py
```

must insert synthetic demo data safely.

---

# 10. Idempotency Rule

Database setup must be safe to rerun.

Never duplicate:

* admin account,
* departments,
* faculty IDs,
* indexes.

Seed scripts should detect existing project-owned records.

---

# 11. Safety Rule (VERY IMPORTANT)

This project has permission to modify **ONLY** resources belonging to:

`research_publication_analytics`

Never execute destructive commands against unknown databases.

Never drop all databases.

Never delete Atlas projects.

Never delete Atlas clusters.

Never modify SpotifyClone.

Never modify unrelated collections.

If cleanup is needed, cleanup must be limited to this project's database only.

---

# 12. Expected Workflow

1. Verify Atlas authentication.
2. Verify Project 0 exists.
3. Verify cluster inside Project 0.
4. Connect using PyMongo.
5. Create `research_publication_analytics`.
6. Create collections.
7. Create indexes.
8. Seed admin.
9. Seed departments.
10. Seed faculty.
11. Seed publications.

No MongoDB Compass.

No Atlas UI setup.

No mongosh.

Everything should be reproducible from terminal + Python scripts.
