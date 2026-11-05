from datetime import UTC, datetime

try:
    from scripts.common import get_database
except ModuleNotFoundError:  # Supports `python scripts/seed_admin.py`.
    from common import get_database
from app.core.security import hash_password

ADMIN_EMAIL = "sumithnalla0607@gmail.com"
ADMIN_PASSWORD = "admin@123"


def seed_admin(database) -> None:
    now = datetime.now(UTC)
    existing = database.users.find_one({"email": ADMIN_EMAIL})
    if existing and not existing.get("seed_owned"):
        raise RuntimeError(f"Refusing to replace an existing non-seed user: {ADMIN_EMAIL}")
    database.users.update_one(
        {"email": ADMIN_EMAIL},
        {
            "$set": {"role": "admin", "status": "active", "updated_at": now, "seed_owned": True},
            "$setOnInsert": {"email": ADMIN_EMAIL, "password_hash": hash_password(ADMIN_PASSWORD), "created_at": now, "last_login": None},
        },
        upsert=True,
    )


if __name__ == "__main__":
    client, db = get_database()
    try:
        seed_admin(db)
        print("Seeded or verified the synthetic demo administrator.")
    finally:
        client.close()
