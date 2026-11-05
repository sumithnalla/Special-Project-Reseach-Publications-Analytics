import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import get_settings  # noqa: E402
from app.db.mongodb import create_client  # noqa: E402


def get_database():
    settings = get_settings()
    if not settings.mongodb_uri:
        raise RuntimeError("MONGODB_URI is required. Copy .env.example to .env and set the Atlas URI.")
    client = create_client(settings.mongodb_uri)
    client.admin.command("ping")
    return client, client[settings.mongodb_database]
