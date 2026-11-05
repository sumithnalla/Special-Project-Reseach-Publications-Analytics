from math import ceil

from bson import ObjectId
from fastapi import HTTPException, status


def public_document(document: dict | None) -> dict | None:
    if document is None:
        return None
    result = {}
    for key, value in document.items():
        if key == "password_hash":
            continue
        if isinstance(value, ObjectId):
            result["id" if key == "_id" else key] = str(value)
        elif isinstance(value, list):
            result[key] = [str(item) if isinstance(item, ObjectId) else item for item in value]
        else:
            result[key] = value
    return result


def public_user(user: dict) -> dict:
    return {"id": str(user["_id"]), "email": user["email"], "role": user["role"], "status": user["status"]}


def faculty_profile(database, user_id: ObjectId) -> dict:
    profile = database.faculty_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty profile not found")
    return profile


def publication_filters(year: int | None, publication_type: str | None, publication_status: str | None, indexing: str | None, quartile: str | None) -> dict:
    filters: dict = {}
    for key, value in (("publication_year", year), ("publication_type", publication_type), ("status", publication_status), ("indexing", indexing), ("quartile", quartile)):
        if value is not None:
            filters[key] = value
    return filters


def paginated(collection, filters: dict, page: int, page_size: int, sort: list[tuple[str, int]]) -> dict:
    total = collection.count_documents(filters)
    items = list(collection.find(filters).sort(sort).skip((page - 1) * page_size).limit(page_size))
    return {"items": [public_document(item) for item in items], "page": page, "page_size": page_size, "total": total, "total_pages": max(1, ceil(total / page_size))}


def enrich_publications(database, publications: list[dict]) -> list[dict]:
    faculty_ids = {item["faculty_id"] for item in publications}
    profiles = {item["_id"]: item for item in database.faculty_profiles.find({"_id": {"$in": list(faculty_ids)}})}
    department_ids = {item["department_id"] for item in profiles.values()}
    departments = {item["_id"]: item for item in database.departments.find({"_id": {"$in": list(department_ids)}})}
    results = []
    for publication in publications:
        item = public_document(publication)
        profile = profiles.get(publication["faculty_id"])
        if profile:
            item["faculty_name"] = profile["name"]
            item["faculty_code"] = profile["faculty_id"]
            department = departments.get(profile["department_id"])
            item["department_name"] = department["name"] if department else "Unknown"
            item["department_id"] = str(profile["department_id"])
        results.append(item)
    return results


def approved_analytics(database, match: dict | None = None) -> dict:
    match = {"status": "approved", **(match or {})}
    overview = list(database.publications.aggregate([
        {"$match": match},
        {"$group": {"_id": None, "total_publications": {"$sum": 1}, "total_citations": {"$sum": "$citation_count"}, "average_citations": {"$avg": "$citation_count"}}},
    ]))
    metrics = overview[0] if overview else {"total_publications": 0, "total_citations": 0, "average_citations": 0}

    def grouped(field: str) -> list[dict]:
        return [{"name": item["_id"], "value": item["value"]} for item in database.publications.aggregate([{"$match": match}, {"$group": {"_id": f"${field}", "value": {"$sum": 1}}}, {"$sort": {"_id": 1}}])]

    yearly = [{"year": item["_id"], "publications": item["publications"], "citations": item["citations"]} for item in database.publications.aggregate([{"$match": match}, {"$group": {"_id": "$publication_year", "publications": {"$sum": 1}, "citations": {"$sum": "$citation_count"}}}, {"$sort": {"_id": 1}}])]
    return {"overview": {"total_publications": metrics.get("total_publications", 0), "total_citations": metrics.get("total_citations", 0), "average_citations": round(metrics.get("average_citations", 0) or 0, 2)}, "yearly": yearly, "types": grouped("publication_type"), "indexing": grouped("indexing"), "quartiles": grouped("quartile")}
