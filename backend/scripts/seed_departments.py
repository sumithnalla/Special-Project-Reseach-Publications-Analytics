from datetime import UTC, datetime

try:
    from scripts.common import get_database
except ModuleNotFoundError:  # Supports `python scripts/seed_departments.py`.
    from common import get_database

DEPARTMENTS = [
    ("Computer Science and Engineering", "CSE"),
    ("Electronics and Communication Engineering", "ECE"),
    ("Electrical and Electronics Engineering", "EEE"),
    ("Mechanical Engineering", "ME"),
    ("Civil Engineering", "CE"),
    ("Information Technology", "IT"),
    ("Artificial Intelligence and Data Science", "AIDS"),
    ("Physics", "PHY"),
    ("Mathematics", "MAT"),
    ("Business Administration", "MBA"),
]


def seed_departments(database) -> int:
    now = datetime.now(UTC)
    for name, code in DEPARTMENTS:
        database.departments.update_one(
            {"code": code},
            {"$set": {"name": name, "status": "active", "updated_at": now}, "$setOnInsert": {"created_at": now, "seed_owned": True}},
            upsert=True,
        )
    return len(DEPARTMENTS)


if __name__ == "__main__":
    client, db = get_database()
    try:
        print(f"Seeded or verified {seed_departments(db)} synthetic departments.")
    finally:
        client.close()
