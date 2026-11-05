import random
from datetime import UTC, datetime, timedelta

from bson import ObjectId

try:
    from scripts.common import get_database
except ModuleNotFoundError:  # Supports `python scripts/seed_demo_data.py`.
    from common import get_database
from app.core.security import hash_password
try:
    from scripts.seed_departments import seed_departments
except ModuleNotFoundError:  # Supports `python scripts/seed_demo_data.py`.
    from seed_departments import seed_departments

RANDOM_SEED = 20260926
FACULTY_COUNT = 75
PUBLICATION_COUNT = 2500
FIRST_NAMES = ["Arjun", "Priya", "Kiran", "Ananya", "Vikram", "Meera", "Rahul", "Sneha", "Naveen", "Kavya", "Rohan", "Divya"]
LAST_NAMES = ["Rao", "Sharma", "Reddy", "Iyer", "Nair", "Verma", "Kapoor", "Das", "Gupta", "Menon"]
DESIGNATIONS = ["Assistant Professor", "Associate Professor", "Professor"]
RESEARCH_AREAS = ["Machine Learning", "Embedded Systems", "Renewable Energy", "Structural Engineering", "Cloud Computing", "Data Science", "Robotics", "Materials Science", "Applied Mathematics", "Business Analytics"]
TITLE_TEMPLATES = [
    "{area} Methods for {domain}",
    "A Synthetic Study of {area} in {domain}",
    "Scalable {area} Frameworks for {domain}",
    "Evaluating {area} Approaches for {domain}",
]
DOMAINS = ["Smart Campuses", "Industrial Systems", "Sustainable Infrastructure", "Academic Information Systems", "Healthcare Data", "Energy Optimization"]
VENUES = ["Journal of Synthetic Research", "International Conference on Applied Innovation", "Demo University Research Press", "Journal of Emerging Engineering Studies"]


def _faculty_document(index: int, department_id: ObjectId, rng: random.Random) -> tuple[dict, dict]:
    name = f"Dr. {rng.choice(FIRST_NAMES)} {rng.choice(LAST_NAMES)}"
    email = f"faculty{index:02d}@demo-university.edu"
    now = datetime.now(UTC)
    user = {"email": email, "password_hash": hash_password("123456"), "role": "faculty", "status": "active", "created_at": now, "updated_at": now, "last_login": None, "seed_owned": True}
    profile = {"faculty_id": f"FAC{index:03d}", "name": name, "department_id": department_id, "designation": rng.choices(DESIGNATIONS, weights=[55, 30, 15])[0], "research_areas": rng.sample(RESEARCH_AREAS, k=2), "joining_year": rng.randint(2008, 2024), "phone": "", "profile_image": None, "created_at": now, "updated_at": now, "seed_owned": True}
    return user, profile


def seed_demo_data(database) -> tuple[int, int]:
    rng = random.Random(RANDOM_SEED)
    seed_departments(database)
    departments = list(database.departments.find({"seed_owned": True}).sort("code", 1))
    if len(departments) < 8:
        raise RuntimeError("Synthetic departments could not be prepared.")

    faculty = []
    for index in range(1, FACULTY_COUNT + 1):
        user, profile = _faculty_document(index, departments[(index - 1) % len(departments)]["_id"], rng)
        current = database.users.find_one({"email": user["email"]})
        if current and not current.get("seed_owned"):
            raise RuntimeError(f"Refusing to replace non-seed faculty user {user['email']}")
        database.users.update_one(
            {"email": user["email"]},
            {
                "$set": {"role": "faculty", "status": "active", "updated_at": user["updated_at"], "seed_owned": True},
                "$setOnInsert": {"email": user["email"], "password_hash": user["password_hash"], "created_at": user["created_at"], "last_login": None},
            },
            upsert=True,
        )
        stored_user = database.users.find_one({"email": user["email"]})
        profile["user_id"] = stored_user["_id"]
        current_profile = database.faculty_profiles.find_one({"faculty_id": profile["faculty_id"]})
        if current_profile and not current_profile.get("seed_owned"):
            raise RuntimeError(f"Refusing to replace non-seed profile {profile['faculty_id']}")
        database.faculty_profiles.update_one({"faculty_id": profile["faculty_id"]}, {"$set": profile}, upsert=True)
        faculty.append(database.faculty_profiles.find_one({"faculty_id": profile["faculty_id"]}))

    publication_count = database.publications.count_documents({"seed_owned": True})
    if publication_count == 0:
        now = datetime.now(UTC)
        publications = []
        for number in range(1, PUBLICATION_COUNT + 1):
            profile = rng.choices(faculty, weights=[1 + (item["_id"].generation_time.year % 3) for item in faculty])[0]
            year = rng.choices(range(2020, 2027), weights=[8, 10, 13, 17, 20, 20, 12])[0]
            publication_type = rng.choices(["journal", "conference", "book_chapter"], weights=[55, 35, 10])[0]
            indexing = rng.choices(["Scopus", "Web of Science", "UGC/Other", "Not Indexed"], weights=[48, 17, 20, 15])[0]
            quartile = "N/A" if indexing == "Not Indexed" or publication_type == "book_chapter" else rng.choices(["Q1", "Q2", "Q3", "Q4"], weights=[22, 36, 27, 15])[0]
            status = rng.choices(["approved", "pending", "rejected"], weights=[75, 16, 9])[0]
            area = rng.choice(profile["research_areas"])
            title = rng.choice(TITLE_TEMPLATES).format(area=area, domain=rng.choice(DOMAINS))
            submitted_at = now - timedelta(days=rng.randint(1, 1300))
            publications.append({
                "faculty_id": profile["_id"], "title": f"{title} ({number})", "authors": [profile["name"], "Dr. Synthetic Collaborator"], "publication_type": publication_type,
                "journal_or_conference": rng.choice(VENUES), "publisher": "Synthetic Academic Publisher", "publication_year": year,
                "doi": f"10.9999/demo.{year}.{number:04d}", "indexing": indexing, "quartile": quartile,
                "impact_factor": 0.0 if publication_type == "conference" else round(rng.uniform(0.8, 8.5), 2),
                "citation_count": max(0, int(rng.expovariate(1 / max(4, (2027 - year) * 5)))), "url": "https://example.edu/synthetic-publications",
                "abstract": f"Synthetic demonstration abstract for {title}.", "status": status, "submitted_at": submitted_at,
                "verified_at": submitted_at + timedelta(days=rng.randint(1, 30)) if status != "pending" else None,
                "verified_by": None, "rejection_reason": "Synthetic verification needs clarification." if status == "rejected" else None,
                "created_at": submitted_at, "updated_at": now, "seed_owned": True,
            })
        database.publications.insert_many(publications, ordered=False)
        publication_count = len(publications)
    return len(faculty), publication_count


if __name__ == "__main__":
    client, db = get_database()
    try:
        faculty_count, publication_count = seed_demo_data(db)
        print(f"Seeded or verified {faculty_count} faculty and {publication_count} synthetic publications.")
    finally:
        client.close()
