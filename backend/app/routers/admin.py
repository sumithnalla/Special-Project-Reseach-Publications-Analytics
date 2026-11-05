import re
from datetime import UTC, date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from pymongo.errors import DuplicateKeyError

from app.core.dependencies import object_id, require_admin
from app.core.security import hash_password
from app.db.mongodb import get_database
from app.schemas import FacultyCreate, FacultyUpdate, PublicationInput, RejectionRequest, StatusUpdate
from app.services.audit import log_action
from app.services.data import approved_analytics, enrich_publications, paginated, public_document, publication_filters
from app.services.reports import build_csv, build_excel, build_pdf, report_documents, report_summary

router = APIRouter(prefix="/api/admin", tags=["Administration"])
AdminUser = Annotated[dict, Depends(require_admin)]


@router.get("/dashboard")
def dashboard(request: Request, user: AdminUser):
    database = get_database(request.app)
    analytics = approved_analytics(database)
    statuses = {item["_id"]: item["count"] for item in database.publications.aggregate([{"$group": {"_id": "$status", "count": {"$sum": 1}}}])}
    analytics["overview"] |= {"active_faculty": database.users.count_documents({"role": "faculty", "status": "active"}), "pending": statuses.get("pending", 0), "rejected": statuses.get("rejected", 0), "publishing_faculty": len(database.publications.distinct("faculty_id", {"status": "approved"}))}
    return analytics


@router.get("/faculty")
def list_faculty(request: Request, user: AdminUser, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), search: str | None = None):
    database = get_database(request.app)
    filters = {}
    if search:
        term = re.escape(search.strip())
        filters["$or"] = [{"name": {"$regex": term, "$options": "i"}}, {"faculty_id": {"$regex": term, "$options": "i"}}]
    result = paginated(database.faculty_profiles, filters, page, page_size, [("name", 1)])
    user_ids = [object_id(item["user_id"], "user") for item in result["items"]]
    users = {str(item["_id"]): item for item in database.users.find({"_id": {"$in": user_ids}})}
    departments = {str(item["_id"]): item["name"] for item in database.departments.find({})}
    for item in result["items"]:
        account = users.get(item["user_id"])
        item["email"] = account["email"] if account else ""
        item["status"] = account["status"] if account else "inactive"
        item["department_name"] = departments.get(item["department_id"], "Unknown")
        item["publication_count"] = database.publications.count_documents({"faculty_id": object_id(item["id"], "faculty")})
    return result


@router.get("/departments")
def list_departments(request: Request, user: AdminUser):
    database = get_database(request.app)
    return [public_document(item) for item in database.departments.find({"status": "active"}).sort("name", 1)]


@router.post("/faculty", status_code=status.HTTP_201_CREATED)
def create_faculty(payload: FacultyCreate, request: Request, user: AdminUser):
    database = get_database(request.app)
    email = str(payload.email).strip().lower()
    faculty_code = payload.faculty_id.strip().upper()
    if database.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email is already registered")
    if database.faculty_profiles.find_one({"faculty_id": faculty_code}):
        raise HTTPException(status_code=409, detail="Faculty ID already exists")
    department_id = object_id(payload.department_id, "department")
    if not database.departments.find_one({"_id": department_id, "status": "active"}):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Department is not active")
    now = datetime.now(UTC)
    try:
        result = database.users.insert_one({"email": email, "password_hash": hash_password(payload.temporary_password), "role": "faculty", "status": "active", "created_at": now, "updated_at": now, "last_login": None})
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Email is already registered") from exc
    profile = payload.model_dump(exclude={"email", "temporary_password", "department_id"}) | {"faculty_id": faculty_code, "user_id": result.inserted_id, "department_id": department_id, "phone": "", "profile_image": None, "created_at": now, "updated_at": now}
    try:
        profile_id = database.faculty_profiles.insert_one(profile).inserted_id
    except Exception as exc:
        database.users.delete_one({"_id": result.inserted_id})
        if isinstance(exc, DuplicateKeyError):
            raise HTTPException(status_code=409, detail="Faculty ID already exists") from exc
        raise
    log_action(database, user["_id"], "CREATE_FACULTY", "faculty_profile", profile_id, {"email": email})
    return public_document(database.faculty_profiles.find_one({"_id": profile_id}))


@router.get("/faculty/{faculty_id}")
def get_faculty(faculty_id: str, request: Request, user: AdminUser):
    database = get_database(request.app)
    profile = database.faculty_profiles.find_one({"_id": object_id(faculty_id, "faculty")})
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found")
    result = public_document(profile)
    account = database.users.find_one({"_id": profile["user_id"]})
    result["email"] = account["email"] if account else ""
    result["status"] = account["status"] if account else "inactive"
    return result


@router.put("/faculty/{faculty_id}")
def update_faculty(faculty_id: str, payload: FacultyUpdate, request: Request, user: AdminUser):
    database = get_database(request.app)
    profile = database.faculty_profiles.find_one({"_id": object_id(faculty_id, "faculty")})
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found")
    updates = payload.model_dump(exclude_none=True)
    if "department_id" in updates:
        updates["department_id"] = object_id(updates["department_id"], "department")
    database.faculty_profiles.update_one({"_id": profile["_id"]}, {"$set": updates | {"updated_at": datetime.now(UTC)}})
    log_action(database, user["_id"], "UPDATE_FACULTY", "faculty_profile", profile["_id"])
    return get_faculty(faculty_id, request, user)


@router.patch("/faculty/{faculty_id}/status")
def set_faculty_status(faculty_id: str, payload: StatusUpdate, request: Request, user: AdminUser):
    database = get_database(request.app)
    profile = database.faculty_profiles.find_one({"_id": object_id(faculty_id, "faculty")})
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found")
    database.users.update_one({"_id": profile["user_id"]}, {"$set": {"status": payload.status, "updated_at": datetime.now(UTC)}})
    log_action(database, user["_id"], "SET_FACULTY_STATUS", "faculty_profile", profile["_id"], {"status": payload.status})
    return {"status": payload.status}


def publication_or_404(database, publication_id: str) -> dict:
    publication = database.publications.find_one({"_id": object_id(publication_id, "publication")})
    if not publication:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found")
    return publication


@router.get("/publications")
def list_publications(request: Request, user: AdminUser, page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=50), search: str | None = None, year: int | None = None, publication_type: str | None = None, publication_status: str | None = Query(None, alias="status"), indexing: str | None = None, quartile: str | None = None, department_id: str | None = None):
    database = get_database(request.app)
    filters = publication_filters(year, publication_type, publication_status, indexing, quartile)
    if department_id:
        faculty_ids = [item["_id"] for item in database.faculty_profiles.find({"department_id": object_id(department_id, "department")}, {"_id": 1})]
        filters["faculty_id"] = {"$in": faculty_ids}
    if search:
        term = re.escape(search.strip())
        filters["$or"] = [{"title": {"$regex": term, "$options": "i"}}, {"journal_or_conference": {"$regex": term, "$options": "i"}}, {"doi": {"$regex": term, "$options": "i"}}]
    total = database.publications.count_documents(filters)
    documents = list(database.publications.find(filters).sort([("submitted_at", -1), ("_id", -1)]).skip((page - 1) * page_size).limit(page_size))
    return {"items": enrich_publications(database, documents), "page": page, "page_size": page_size, "total": total, "total_pages": max(1, (total + page_size - 1) // page_size)}


@router.get("/publications/pending")
def pending_publications(request: Request, user: AdminUser, page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=50)):
    return list_publications(request, user, page=page, page_size=page_size, search=None, year=None, publication_type=None, publication_status="pending", indexing=None, quartile=None, department_id=None)


@router.get("/publications/{publication_id}")
def get_publication(publication_id: str, request: Request, user: AdminUser):
    database = get_database(request.app)
    return enrich_publications(database, [publication_or_404(database, publication_id)])[0]


@router.put("/publications/{publication_id}")
def update_publication(publication_id: str, payload: PublicationInput, request: Request, user: AdminUser):
    database = get_database(request.app)
    publication = publication_or_404(database, publication_id)
    database.publications.update_one({"_id": publication["_id"]}, {"$set": payload.model_dump() | {"updated_at": datetime.now(UTC)}})
    log_action(database, user["_id"], "ADMIN_UPDATE_PUBLICATION", "publication", publication["_id"])
    return get_publication(publication_id, request, user)


@router.patch("/publications/{publication_id}/approve")
def approve_publication(publication_id: str, request: Request, user: AdminUser):
    database = get_database(request.app)
    publication = publication_or_404(database, publication_id)
    if publication["status"] == "approved":
        return get_publication(publication_id, request, user)
    database.publications.update_one({"_id": publication["_id"]}, {"$set": {"status": "approved", "verified_at": datetime.now(UTC), "verified_by": user["_id"], "rejection_reason": None, "updated_at": datetime.now(UTC)}})
    log_action(database, user["_id"], "APPROVE_PUBLICATION", "publication", publication["_id"], {"title": publication["title"]})
    return get_publication(publication_id, request, user)


@router.patch("/publications/{publication_id}/reject")
def reject_publication(publication_id: str, payload: RejectionRequest, request: Request, user: AdminUser):
    database = get_database(request.app)
    publication = publication_or_404(database, publication_id)
    database.publications.update_one({"_id": publication["_id"]}, {"$set": {"status": "rejected", "verified_at": datetime.now(UTC), "verified_by": user["_id"], "rejection_reason": payload.reason, "updated_at": datetime.now(UTC)}})
    log_action(database, user["_id"], "REJECT_PUBLICATION", "publication", publication["_id"], {"reason": payload.reason})
    return get_publication(publication_id, request, user)


@router.delete("/publications/{publication_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_publication(publication_id: str, request: Request, user: AdminUser):
    database = get_database(request.app)
    publication = publication_or_404(database, publication_id)
    database.publications.delete_one({"_id": publication["_id"]})
    log_action(database, user["_id"], "ADMIN_DELETE_PUBLICATION", "publication", publication["_id"], {"title": publication["title"]})


@router.get("/analytics/overview")
def analytics_overview(request: Request, user: AdminUser):
    return approved_analytics(get_database(request.app))


@router.get("/analytics/departments")
def analytics_departments(request: Request, user: AdminUser):
    database = get_database(request.app)
    pipeline = [{"$match": {"status": "approved"}}, {"$lookup": {"from": "faculty_profiles", "localField": "faculty_id", "foreignField": "_id", "as": "faculty"}}, {"$unwind": "$faculty"}, {"$lookup": {"from": "departments", "localField": "faculty.department_id", "foreignField": "_id", "as": "department"}}, {"$unwind": "$department"}, {"$group": {"_id": "$department.name", "publications": {"$sum": 1}, "citations": {"$sum": "$citation_count"}}}, {"$sort": {"publications": -1}}]
    return [{"name": item["_id"], "publications": item["publications"], "citations": item["citations"]} for item in database.publications.aggregate(pipeline)]


@router.get("/analytics/faculty")
def analytics_faculty(request: Request, user: AdminUser):
    database = get_database(request.app)
    pipeline = [{"$match": {"status": "approved"}}, {"$group": {"_id": "$faculty_id", "publications": {"$sum": 1}, "citations": {"$sum": "$citation_count"}}}, {"$sort": {"publications": -1}}, {"$limit": 15}, {"$lookup": {"from": "faculty_profiles", "localField": "_id", "foreignField": "_id", "as": "faculty"}}, {"$unwind": "$faculty"}]
    return [{"name": item["faculty"]["name"], "publications": item["publications"], "citations": item["citations"]} for item in database.publications.aggregate(pipeline)]


def report_filter_params(year: int | None = None, department_id: str | None = None, faculty_id: str | None = None, topic: str | None = Query(None, max_length=100), publication_type: str | None = Query(None, pattern="^(journal|conference|book_chapter)$"), publication_status: str = Query("approved", alias="status", pattern="^(all|pending|approved|rejected)$"), date_from: date | None = None, date_to: date | None = None):
    return {"year": year, "department_id": department_id, "faculty_id": faculty_id, "topic": topic, "publication_type": publication_type, "publication_status": publication_status, "date_from": date_from, "date_to": date_to}


ReportParams = Annotated[dict, Depends(report_filter_params)]


@router.get("/reports/options")
def report_options(request: Request, user: AdminUser):
    database = get_database(request.app)
    return {"departments": list_departments(request, user), "faculty": [{"id": str(item["_id"]), "name": item["name"], "faculty_id": item["faculty_id"], "department_id": str(item["department_id"])} for item in database.faculty_profiles.find({}, {"name": 1, "faculty_id": 1, "department_id": 1}).sort("name", 1)]}


@router.get("/reports/publications/summary")
def report_preview(request: Request, user: AdminUser, filters: ReportParams):
    return report_summary(report_documents(get_database(request.app), **filters))


def report_download(request: Request, user: dict, filters: dict, kind: str):
    database = get_database(request.app)
    docs = report_documents(database, **filters)
    streams = {"csv": (lambda: build_csv(docs), "text/csv; charset=utf-8", "csv"), "pdf": (lambda: build_pdf(database, docs=docs), "application/pdf", "pdf"), "excel": (lambda: build_excel(database, docs=docs), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx")}
    build, media_type, extension = streams[kind]
    stream = build()
    log_action(database, user["_id"], f"GENERATE_{kind.upper()}_REPORT", "report", user["_id"], {"filters": {key: str(value) for key, value in filters.items() if value is not None}, "records": len(docs)})
    return StreamingResponse(stream, media_type=media_type, headers={"Content-Disposition": f"attachment; filename=research-publication-analytics-report.{extension}"})


@router.get("/reports/publications/csv")
def report_csv(request: Request, user: AdminUser, filters: ReportParams):
    return report_download(request, user, filters, "csv")


@router.get("/reports/publications/pdf")
def report_pdf(request: Request, user: AdminUser, filters: ReportParams):
    return report_download(request, user, filters, "pdf")


@router.get("/reports/publications/excel")
def report_excel(request: Request, user: AdminUser, filters: ReportParams):
    return report_download(request, user, filters, "excel")


@router.get("/audit-logs")
def audit_logs(request: Request, user: AdminUser, page: int = Query(1, ge=1), page_size: int = Query(30, ge=1, le=100)):
    database = get_database(request.app)
    result = paginated(database.audit_logs, {}, page, page_size, [("timestamp", -1)])
    users = {str(item["_id"]): item["email"] for item in database.users.find({})}
    for item in result["items"]:
        item["user_email"] = users.get(item["user_id"], "System")
    return result
