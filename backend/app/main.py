from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.mongodb import mongodb_lifespan
from app.routers import admin, auth, faculty

settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=mongodb_lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_credentials=False, allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allow_headers=["Authorization", "Content-Type"])
app.include_router(auth.router)
app.include_router(faculty.router)
app.include_router(admin.router)


@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "service": settings.app_name}
