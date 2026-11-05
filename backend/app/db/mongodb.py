from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import get_settings


def create_client(uri: str) -> MongoClient:
    return MongoClient(uri, serverSelectionTimeoutMS=8000, connectTimeoutMS=8000, tz_aware=True)


def get_database(app: FastAPI) -> Database:
    database = getattr(app.state, "database", None)
    if database is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database is not available")
    return database


@asynccontextmanager
async def mongodb_lifespan(app: FastAPI):
    settings = get_settings()
    if not settings.mongodb_uri:
        app.state.mongo_client = None
        app.state.database = None
        yield
        return

    client = create_client(settings.mongodb_uri)
    try:
        client.admin.command("ping")
        app.state.mongo_client = client
        app.state.database = client[settings.mongodb_database]
        yield
    finally:
        client.close()
        app.state.mongo_client = None
        app.state.database = None
