from datetime import UTC, datetime

import mongomock

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.db.indexes import COLLECTIONS, initialize_database
from scripts.seed_admin import ADMIN_EMAIL, seed_admin
from scripts.seed_demo_data import seed_demo_data
from scripts.seed_departments import seed_departments


def test_password_hash_and_token_round_trip():
    password_hash = hash_password("123456")
    assert password_hash != "123456"
    assert verify_password("123456", password_hash)
    assert not verify_password("wrong", password_hash)
    token = create_access_token("507f1f77bcf86cd799439011", "faculty")
    assert decode_access_token(token)["role"] == "faculty"


def test_database_initialization_and_idempotent_core_seeds():
    database = mongomock.MongoClient().research_publication_analytics
    initialize_database(database)
    initialize_database(database)
    assert set(COLLECTIONS).issubset(database.list_collection_names())
    assert database.users.index_information()["users_email_unique"]["unique"]

    assert seed_departments(database) == 10
    assert seed_departments(database) == 10
    seed_admin(database)
    seed_admin(database)
    assert database.departments.count_documents({"seed_owned": True}) == 10
    assert database.users.count_documents({"email": ADMIN_EMAIL}) == 1


def test_synthetic_data_seed_is_reusable(monkeypatch):
    import scripts.seed_demo_data as seed_module

    monkeypatch.setattr(seed_module, "FACULTY_COUNT", 3)
    monkeypatch.setattr(seed_module, "PUBLICATION_COUNT", 12)
    database = mongomock.MongoClient().research_publication_analytics
    initialize_database(database)
    first = seed_demo_data(database)
    second = seed_demo_data(database)
    assert first == (3, 12)
    assert second == (3, 12)
    assert database.users.count_documents({"role": "faculty"}) == 3
    assert database.faculty_profiles.count_documents({"seed_owned": True}) == 3
    assert database.publications.count_documents({"seed_owned": True}) == 12
    assert database.publications.count_documents({"status": "approved"}) > 0
