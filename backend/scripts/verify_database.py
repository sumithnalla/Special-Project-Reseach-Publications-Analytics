try:
    from scripts.common import get_database
except ModuleNotFoundError:  # Supports `python scripts/verify_database.py`.
    from common import get_database

from app.db.indexes import COLLECTIONS


def verify_database(database) -> dict:
    available = set(database.list_collection_names())
    missing = sorted(set(COLLECTIONS) - available)
    if missing:
        raise RuntimeError(f"Missing required collections: {', '.join(missing)}")

    required_indexes = {
        "users": "users_email_unique",
        "faculty_profiles": "faculty_id_unique",
        "departments": "department_code_unique",
        "publications": "faculty_status_year",
        "audit_logs": "audit_timestamp",
    }
    for collection, index_name in required_indexes.items():
        if index_name not in database[collection].index_information():
            raise RuntimeError(f"Missing required index {index_name} on {collection}")

    summary = {
        "collections": len(COLLECTIONS),
        "departments": database.departments.count_documents({"seed_owned": True}),
        "faculty": database.faculty_profiles.count_documents({"seed_owned": True}),
        "publications": database.publications.count_documents({"seed_owned": True}),
        "admin": database.users.count_documents({"email": "sumithnalla0607@gmail.com", "role": "admin", "status": "active"}),
        "publication_statuses": {item["_id"]: item["count"] for item in database.publications.aggregate([{"$match": {"seed_owned": True}}, {"$group": {"_id": "$status", "count": {"$sum": 1}}}])},
    }
    if summary["departments"] != 10 or summary["faculty"] != 75 or summary["publications"] != 2500 or summary["admin"] != 1:
        raise RuntimeError(f"Unexpected seed counts: {summary}")
    if not all(summary["publication_statuses"].get(status, 0) for status in ("approved", "pending", "rejected")):
        raise RuntimeError("Seed data must contain approved, pending, and rejected publications")
    return summary


if __name__ == "__main__":
    client, db = get_database()
    try:
        print(verify_database(db))
    finally:
        client.close()
