from contextlib import asynccontextmanager
from datetime import UTC, datetime

import mongomock
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.db.indexes import initialize_database
from app.routers import admin, auth, faculty


@asynccontextmanager
async def no_lifespan(app):
    yield


def test_application_workflow_and_role_boundaries():
    database = mongomock.MongoClient().research_publication_analytics
    initialize_database(database)
    department_id = database.departments.insert_one({"name": "Computer Science and Engineering", "code": "CSE", "status": "active"}).inserted_id
    admin_id = database.users.insert_one({"email": "admin@example.edu", "password_hash": hash_password("admin@123"), "role": "admin", "status": "active", "created_at": datetime.now(UTC)}).inserted_id
    faculty_user_id = database.users.insert_one({"email": "faculty@example.edu", "password_hash": hash_password("123456"), "role": "faculty", "status": "active", "created_at": datetime.now(UTC)}).inserted_id
    faculty_two_id = database.users.insert_one({"email": "faculty2@example.edu", "password_hash": hash_password("123456"), "role": "faculty", "status": "active", "created_at": datetime.now(UTC)}).inserted_id
    database.faculty_profiles.insert_one({"user_id": faculty_user_id, "faculty_id": "FAC001", "name": "Dr. Faculty One", "department_id": department_id, "designation": "Assistant Professor", "research_areas": ["AI"], "joining_year": 2020})
    second_profile_id = database.faculty_profiles.insert_one({"user_id": faculty_two_id, "faculty_id": "FAC002", "name": "Dr. Faculty Two", "department_id": department_id, "designation": "Assistant Professor", "research_areas": ["AI"], "joining_year": 2021}).inserted_id
    application = FastAPI(lifespan=no_lifespan)
    application.state.database = database
    application.include_router(auth.router)
    application.include_router(faculty.router)
    application.include_router(admin.router)
    client = TestClient(application)
    faculty_token = client.post("/api/auth/login", json={"email": "faculty@example.edu", "password": "123456"}).json()["access_token"]
    admin_token = client.post("/api/auth/login", json={"email": "admin@example.edu", "password": "admin@123"}).json()["access_token"]
    faculty_headers = {"Authorization": f"Bearer {faculty_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {"title": "Synthetic Secure Research Framework", "authors": ["Dr. Faculty One"], "publication_type": "journal", "journal_or_conference": "Synthetic Journal", "publisher": "Demo Publisher", "publication_year": 2026, "doi": "10.9999/demo.workflow", "indexing": "Scopus", "quartile": "Q1", "impact_factor": 4.2, "citation_count": 3, "url": "", "abstract": "Synthetic test abstract."}
    created = client.post("/api/faculty/publications", headers=faculty_headers, json=payload)
    assert created.status_code == 201
    publication_id = created.json()["id"]
    assert created.json()["status"] == "pending"
    assert client.get("/api/admin/dashboard", headers=faculty_headers).status_code == 403
    assert client.patch(f"/api/admin/publications/{publication_id}/approve", headers=faculty_headers).status_code == 403
    assert client.patch(f"/api/admin/publications/{publication_id}/approve", headers=admin_headers).status_code == 200
    dashboard = client.get("/api/faculty/dashboard", headers=faculty_headers).json()
    assert dashboard["stats"]["total_publications"] == 1
    assert dashboard["stats"]["total_citations"] == 3
    pdf = client.get("/api/admin/reports/publications/pdf", headers=admin_headers)
    spreadsheet = client.get("/api/admin/reports/publications/excel", headers=admin_headers)
    assert pdf.status_code == 200 and pdf.content.startswith(b"%PDF")
    assert spreadsheet.status_code == 200 and spreadsheet.content.startswith(b"PK")
    assert database.audit_logs.count_documents({"action": "APPROVE_PUBLICATION"}) == 1
    other_publication_id = database.publications.insert_one({**payload, "faculty_id": second_profile_id, "status": "pending", "submitted_at": datetime.now(UTC), "created_at": datetime.now(UTC), "updated_at": datetime.now(UTC)}).inserted_id
    assert client.get(f"/api/faculty/publications/{other_publication_id}", headers=faculty_headers).status_code == 404
