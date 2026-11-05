from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core.dependencies import object_id, require_faculty
from app.db.mongodb import get_database
from app.schemas import ProfileUpdate, PublicationInput
from app.services.audit import log_action
from app.services.data import approved_analytics, enrich_publications, faculty_profile, paginated, public_document, publication_filters

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])
FacultyUser = Annotated[dict, Depends(require_faculty)]


@router.get("/profile")
def get_profile(request: Request, user: FacultyUser):
    database = get_database(request.app)
    profile = faculty_profile(database, user["_id"])
    result = public_document(profile)
    result["email"] = user["email"]
    department = database.departments.find_one({"_id": profile["department_id"]})
    result["department_name"] = department["name"] if department else "Unknown"
    return result


@router.put("/profile")
def update_profile(payload: ProfileUpdate, request: Request, user: FacultyUser):
    database = get_database(request.app)
    profile = faculty_profile(database, user["_id"])
    updates = payload.model_dump() | {"updated_at": datetime.now(UTC)}
    database.faculty_profiles.update_one({"_id": profile["_id"]}, {"$set": updates})
    log_action(database, user["_id"], "UPDATE_PROFILE", "faculty_profile", profile["_id"])
    return get_profile(request, user)


@router.get("/dashboard")
def dashboard(request: Request, user: FacultyUser):
    database = get_database(request.app)
    profile = faculty_profile(database, user["_id"])
    all_statuses = {item["_id"]: item["count"] for item in database.publications.aggregate([{"$match": {"faculty_id": profile["_id"]}}, {"$group": {"_id": "$status", "count": {"$sum": 1}}}])}
    analytics = approved_analytics(database, {"faculty_id": profile["_id"]})
    latest = list(database.publications.find({"faculty_id": profile["_id"]}).sort("submitted_at", -1).limit(6))
    return {"profile": {"name": profile["name"], "faculty_id": profile["faculty_id"]}, "stats": {**analytics["overview"], "pending": all_statuses.get("pending", 0), "rejected": all_statuses.get("rejected", 0), "journal_publications": next((item["value"] for item in analytics["types"] if item["name"] == "journal"), 0), "conference_publications": next((item["value"] for item in analytics["types"] if item["name"] == "conference"), 0), "scopus_publications": next((item["value"] for item in analytics["indexing"] if item["name"] == "Scopus"), 0)}, "analytics": analytics, "recent_publications": [public_document(item) for item in latest]}


@router.get("/analytics")
def analytics(request: Request, user: FacultyUser):
    database = get_database(request.app)
    return approved_analytics(database, {"faculty_id": faculty_profile(database, user["_id"])["_id"]})


@router.get("/publications")
def list_publications(request: Request, user: FacultyUser, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), search: str | None = None, year: int | None = None, publication_type: str | None = None, publication_status: str | None = Query(None, alias="status"), indexing: str | None = None, quartile: str | None = None):
    database = get_database(request.app)
    filters = {"faculty_id": faculty_profile(database, user["_id"])["_id"]} | publication_filters(year, publication_type, publication_status, indexing, quartile)
    if search:
        filters["$or"] = [{"title": {"$regex": search, "$options": "i"}}, {"journal_or_conference": {"$regex": search, "$options": "i"}}, {"doi": {"$regex": search, "$options": "i"}}]
    result = paginated(database.publications, filters, page, page_size, [("submitted_at", -1)])
    return result


def owned_publication(database, user: dict, publication_id: str) -> dict:
    publication = database.publications.find_one({"_id": object_id(publication_id, "publication"), "faculty_id": faculty_profile(database, user["_id"])["_id"]})
    if not publication:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")
    return publication


@router.get("/publications/{publication_id}")
def get_publication(publication_id: str, request: Request, user: FacultyUser):
    return public_document(owned_publication(get_database(request.app), user, publication_id))


@router.post("/publications", status_code=status.HTTP_201_CREATED)
def create_publication(payload: PublicationInput, request: Request, user: FacultyUser):
    database = get_database(request.app)
    profile = faculty_profile(database, user["_id"])
    now = datetime.now(UTC)
    document = payload.model_dump() | {"faculty_id": profile["_id"], "status": "pending", "submitted_at": now, "verified_at": None, "verified_by": None, "rejection_reason": None, "created_at": now, "updated_at": now}
    result = database.publications.insert_one(document)
    log_action(database, user["_id"], "CREATE_PUBLICATION", "publication", result.inserted_id, {"title": payload.title})
    return public_document(database.publications.find_one({"_id": result.inserted_id}))


@router.put("/publications/{publication_id}")
def update_publication(publication_id: str, payload: PublicationInput, request: Request, user: FacultyUser):
    database = get_database(request.app)
    publication = owned_publication(database, user, publication_id)
    updates = payload.model_dump() | {"updated_at": datetime.now(UTC)}
    if publication["status"] == "rejected":
        updates |= {"status": "pending", "rejection_reason": None, "verified_at": None, "verified_by": None, "submitted_at": datetime.now(UTC)}
    database.publications.update_one({"_id": publication["_id"]}, {"$set": updates})
    log_action(database, user["_id"], "UPDATE_PUBLICATION", "publication", publication["_id"])
    return public_document(database.publications.find_one({"_id": publication["_id"]}))


@router.delete("/publications/{publication_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_publication(publication_id: str, request: Request, user: FacultyUser):
    database = get_database(request.app)
    publication = owned_publication(database, user, publication_id)
    database.publications.delete_one({"_id": publication["_id"]})
    log_action(database, user["_id"], "DELETE_PUBLICATION", "publication", publication["_id"], {"title": publication["title"]})
