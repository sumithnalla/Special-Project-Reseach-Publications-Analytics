import csv
from datetime import UTC, datetime
from io import StringIO

import mongomock
from fastapi.testclient import TestClient
from pymongo.errors import DuplicateKeyError

from app.core.security import hash_password
from app.db.indexes import initialize_database
from app.main import app


def setup_client():
    database = mongomock.MongoClient().research_publication_analytics
    initialize_database(database)
    department = database.departments.insert_one({"name": "Physics", "code": "PHY", "status": "active"}).inserted_id
    admin = database.users.insert_one({"email": "admin@example.edu", "password_hash": hash_password("admin@123"), "role": "admin", "status": "active"}).inserted_id
    faculty_user = database.users.insert_one({"email": "faculty@example.edu", "password_hash": hash_password("123456"), "role": "faculty", "status": "active"}).inserted_id
    faculty = database.faculty_profiles.insert_one({"name": "Dr. Test", "faculty_id": "FAC001", "user_id": faculty_user, "department_id": department, "designation": "Professor", "research_areas": ["robotics"]}).inserted_id
    app.state.database = database
    client = TestClient(app)
    token = client.post("/api/auth/login", json={"email": "admin@example.edu", "password": "admin@123"}).json()["access_token"]
    return client, database, {"Authorization": f"Bearer {token}"}, department, faculty, admin


def publication(database, faculty, number, status="pending"):
    return database.publications.insert_one({"faculty_id": faculty, "title": f"Robotics Study {number:03}", "authors": ["Dr. Test"], "publication_type": "journal", "journal_or_conference": "Physics Review", "publisher": "Test", "publication_year": 2026, "doi": f"10.1/{number}", "indexing": "Scopus", "quartile": "Q1", "impact_factor": 2, "citation_count": number, "url": "", "abstract": "robotics", "status": status, "submitted_at": datetime(2026, 5, 1, tzinfo=UTC), "created_at": datetime.now(UTC), "updated_at": datetime.now(UTC)}).inserted_id


def test_faculty_duplicate_validation_and_creation():
    client, db, headers, department, _, _ = setup_client()
    payload = {"name": "Dr. New Faculty", "email": "faculty@example.edu", "faculty_id": "NEW001", "department_id": str(department), "designation": "Assistant Professor", "research_areas": ["AI"], "joining_year": 2022, "temporary_password": "123456"}
    duplicate_email = client.post("/api/admin/faculty", headers=headers, json=payload)
    assert duplicate_email.status_code == 409 and duplicate_email.json()["detail"] == "Email is already registered"
    assert db.users.count_documents({}) == 2
    payload["email"] = "new@example.edu"
    payload["faculty_id"] = "FAC001"
    duplicate_code = client.post("/api/admin/faculty", headers=headers, json=payload)
    assert duplicate_code.status_code == 409 and duplicate_code.json()["detail"] == "Faculty ID already exists"
    assert db.users.count_documents({}) == 2
    payload["faculty_id"] = "new001"
    created = client.post("/api/admin/faculty", headers=headers, json=payload)
    assert created.status_code == 201 and created.json()["faculty_id"] == "NEW001"
    assert db.users.count_documents({"email": "new@example.edu"}) == 1


def test_faculty_profile_write_race_does_not_leave_orphan(monkeypatch):
    client, db, headers, department, _, _ = setup_client()
    def conflict(_profile):
        raise DuplicateKeyError("faculty_id_unique")
    monkeypatch.setattr(db.faculty_profiles, "insert_one", conflict)
    payload = {"name": "Dr. New Faculty", "email": "new@example.edu", "faculty_id": "NEW001", "department_id": str(department), "designation": "Professor", "research_areas": [], "joining_year": 2022, "temporary_password": "123456"}
    response = client.post("/api/admin/faculty", headers=headers, json=payload)
    assert response.status_code == 409
    assert db.users.count_documents({"email": "new@example.edu"}) == 0


def test_review_cors_pagination_filters_reports_and_delete():
    client, db, headers, department, faculty, _ = setup_client()
    for number in range(52):
        publication(db, faculty, number)
    for origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
        preflight = client.options("/api/admin/publications/abc/approve", headers={"Origin": origin, "Access-Control-Request-Method": "PATCH", "Access-Control-Request-Headers": "authorization,content-type"})
        assert preflight.status_code == 200
        assert preflight.headers["access-control-allow-origin"] == origin
        assert "PATCH" in preflight.headers["access-control-allow-methods"]
    first = client.get("/api/admin/publications", headers=headers, params={"page_size": 50})
    second = client.get("/api/admin/publications", headers=headers, params={"page_size": 50, "page": 2})
    assert (len(first.json()["items"]), len(second.json()["items"]), first.json()["total"], first.json()["total_pages"]) == (50, 2, 52, 2)
    assert not ({item["id"] for item in first.json()["items"]} & {item["id"] for item in second.json()["items"]})
    assert client.get("/api/admin/publications", headers=headers, params={"page_size": 51}).status_code == 422
    filtered = client.get("/api/admin/publications", headers=headers, params={"search": "Study 005", "status": "pending", "department_id": str(department), "page_size": 50})
    assert filtered.json()["total"] == 1
    target = filtered.json()["items"][0]["id"]
    approved = client.patch(f"/api/admin/publications/{target}/approve", headers=headers)
    assert approved.status_code == 200 and approved.json()["status"] == "approved"
    assert approved.json()["verified_by"]
    rejected = client.patch(f"/api/admin/publications/{target}/reject", headers=headers, json={"reason": "Needs correction"})
    assert rejected.status_code == 200 and rejected.json()["status"] == "rejected"
    assert rejected.json()["rejection_reason"] == "Needs correction"
    params = {"faculty_id": str(faculty), "department_id": str(department), "topic": "robotics", "publication_type": "journal", "status": "rejected", "date_from": "2026-05-01", "date_to": "2026-05-01"}
    summary = client.get("/api/admin/reports/publications/summary", headers=headers, params=params)
    assert summary.status_code == 200 and summary.json()["total_publications"] == 1 and summary.json()["total_citations"] == 5
    assert summary.json()["yearly"] == [{"year": 2026, "publications": 1, "citations": 5}]
    csv_response = client.get("/api/admin/reports/publications/csv", headers=headers, params=params)
    rows = list(csv.DictReader(StringIO(csv_response.content.decode("utf-8-sig"))))
    assert csv_response.status_code == 200 and len(rows) == 1 and rows[0]["Status"] == "rejected"
    pdf = client.get("/api/admin/reports/publications/pdf", headers=headers, params=params)
    assert pdf.status_code == 200 and pdf.content.startswith(b"%PDF")
    invalid_dates = client.get("/api/admin/reports/publications/summary", headers=headers, params={"date_from": "2026-05-02", "date_to": "2026-05-01"})
    assert invalid_dates.status_code == 422
    deleted = client.delete(f"/api/admin/publications/{target}", headers=headers)
    assert deleted.status_code == 204
    assert db.publications.count_documents({}) == 51
