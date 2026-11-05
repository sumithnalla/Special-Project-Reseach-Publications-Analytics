from pymongo import ASCENDING, DESCENDING
from pymongo.database import Database

COLLECTIONS = ("users", "faculty_profiles", "departments", "publications", "audit_logs")


def initialize_database(database: Database) -> None:
    existing = set(database.list_collection_names())
    for collection in COLLECTIONS:
        if collection not in existing:
            database.create_collection(collection)

    database.users.create_index("email", unique=True, name="users_email_unique")
    database.faculty_profiles.create_index("user_id", unique=True, name="faculty_user_unique")
    database.faculty_profiles.create_index("faculty_id", unique=True, name="faculty_id_unique")
    database.faculty_profiles.create_index("department_id", name="faculty_department")
    database.departments.create_index("code", unique=True, name="department_code_unique")
    database.publications.create_index("faculty_id", name="publication_faculty")
    database.publications.create_index("publication_year", name="publication_year")
    database.publications.create_index("status", name="publication_status")
    database.publications.create_index("publication_type", name="publication_type")
    database.publications.create_index("indexing", name="publication_indexing")
    database.publications.create_index("submitted_at", name="publication_submitted_at")
    database.publications.create_index(
        [("faculty_id", ASCENDING), ("status", ASCENDING), ("publication_year", DESCENDING)],
        name="faculty_status_year",
    )
    database.audit_logs.create_index("user_id", name="audit_user")
    database.audit_logs.create_index("timestamp", name="audit_timestamp")
