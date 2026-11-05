# Research Publication Analytics System - Delivery Tracker

## Project rules

- MongoDB resources are limited to the `research_publication_analytics` database in Atlas `Project 0` (`68306879f90e344aa985d26e`).
- Atlas CLI is used for Atlas inspection only; PyMongo owns database setup, seeding, CRUD, and aggregation.
- `mongosh` must never be used.
- Synthetic demo data only. No unrelated Atlas project, cluster, database, collection, user, or access rule may be changed.

## Phase 1 - Foundation and database

- [x] Read and reconcile all supplied specifications.
- [x] Verify Windows, Python, Node, npm, Atlas CLI, and Atlas authentication.
- [x] Verify the permitted Atlas project and inspect its cluster without modifying it.
- [x] Record the existing paused `BookingProject` cluster as out of scope until an application-specific connection string is supplied.
- [x] Create backend structure, environment configuration, security primitives, and database module.
- [x] Create idempotent PyMongo setup and synthetic seed scripts.
- [x] Add database indexes and setup verification.
- [x] Add backend unit tests for configuration, authentication, authorization, and database setup helpers.
- [x] Verify Phase 1 locally: compilation and 3 foundation tests pass.
- [x] Verify Phase 1 against Atlas using the dedicated application database user and the now-running, user-authorized `BookingProject` cluster. Live counts and indexes verified after a second idempotent seed run.

## Phase 2 - Backend workflows and reporting

- [x] Implement authenticated faculty profile, publication, dashboard, and analytics APIs.
- [x] Implement admin faculty, publication review, analytics, audit-log, and report APIs.
- [x] Enforce role and publication ownership checks on every protected path.
- [x] Generate filter-aware PDF and Excel reports.
- [x] Test the core API workflow and authorization boundaries: 4 local API tests plus live Atlas-backed HTTP smoke test pass.
- [x] Verify all Phase 1 checks before marking Phase 2 complete.

## Phase 3 - React application and end-to-end verification

- [x] Build login, protected routing, role-aware navigation, dashboards, tables, forms, filters, charts, reports, and audit-log views.
- [x] Connect every UI action to a live backend API; add loading, error, empty, and confirmation states.
- [x] Build frontend and run backend tests.
- [x] Run the faculty-submit to admin-approve end-to-end smoke test against the configured database.
- [x] Update README with exact setup, seed, run, API, demo, and verification instructions.
- [x] Verify all prior phases before final completion.

## Last verified state

2026-09-26: All three phases are complete. The user resumed the explicitly authorized `BookingProject` M0 cluster through Atlas UI; it is now used only through the dedicated `research_publication_analytics_app` user, restricted to the `research_publication_analytics` database. Live verification after idempotent reseeding: 5 collections, 10 departments, 75 faculty, 2,500 publications, and 1 active demo admin. Verification passed: 4 backend tests, production frontend build, live role endpoint smoke test, and a live faculty-submit -> admin-approve -> analytics-update workflow (the temporary verification publication was deleted after checking). The Vite frontend and FastAPI backend are running locally at the recorded handoff URLs.

## Bugs-1 follow-up (2026-11-05)

- [x] Initial GitHub upload before application changes: `d625296` on `origin/main`; secrets and dependencies ignored.
- [x] Atlas CLI confirms authorized `BookingProject` M0 is running; PyMongo read-only verification passes against the application database.
- [x] Diagnose screenshot faculty conflict (email already exists); report precise email/ID conflicts and remove newly inserted user if profile creation fails.
- [x] Add designation choices for creation and editing.
- [x] Verify PATCH preflight for both local origins; declare methods and headers explicitly and test approve/reject responses.
- [x] Add 50-row publication pages, serial numbers, page controls, totals, and combined search/filters.
- [x] Add filterable report preview plus CSV/PDF/Excel exports using the same matching records.
- [x] Remove Pending and Analytics navigation/routes while retaining both dashboards.
- [x] Add focused regression tests and build frontend.
- [x] Update database verifier to accept normal publication deletions without reseeding.
- [x] Final live-server smoke test after backend restart, review diff, commit and push completed changes.

Current read-only Atlas check: five collections, 10 seeded departments, 75 seeded faculty, 2,494 remaining seeded publications, one active demo admin. No existing Atlas records were modified by this follow-up.
Final checks: seven backend tests passed, frontend production build passed, local API health returned 200, new report route required authentication, and PATCH preflight returned 200 with the expected methods and origin. The frontend and backend remain available on ports 5173 and 8000.
