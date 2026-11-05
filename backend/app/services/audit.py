from datetime import UTC, datetime


def log_action(database, user_id, action: str, entity_type: str, entity_id, details: dict | None = None) -> None:
    database.audit_logs.insert_one({"user_id": user_id, "action": action, "entity_type": entity_type, "entity_id": entity_id, "timestamp": datetime.now(UTC), "details": details or {}})
