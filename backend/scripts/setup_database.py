try:
    from scripts.common import get_database
except ModuleNotFoundError:  # Supports `python scripts/setup_database.py`.
    from common import get_database
from app.db.indexes import COLLECTIONS, initialize_database
try:
    from scripts.seed_admin import seed_admin
    from scripts.seed_departments import seed_departments
except ModuleNotFoundError:  # Supports `python scripts/setup_database.py`.
    from seed_admin import seed_admin
    from seed_departments import seed_departments


if __name__ == "__main__":
    client, db = get_database()
    try:
        initialize_database(db)
        seed_departments(db)
        seed_admin(db)
        available = set(db.list_collection_names())
        missing = set(COLLECTIONS) - available
        if missing:
            raise RuntimeError(f"Database setup verification failed. Missing: {sorted(missing)}")
        print(f"Database '{db.name}' is ready with collections: {', '.join(COLLECTIONS)}")
    finally:
        client.close()
