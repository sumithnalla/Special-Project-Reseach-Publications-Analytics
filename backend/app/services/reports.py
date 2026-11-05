import csv
import re
from collections import Counter
from datetime import UTC, datetime, time, timedelta
from html import escape
from io import BytesIO, StringIO

from fastapi import HTTPException
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import LongTable, Paragraph, SimpleDocTemplate, Spacer, TableStyle

from app.core.dependencies import object_id
from app.services.data import enrich_publications

HEADERS = ["Faculty", "Department", "Title", "Authors", "Type", "Year", "Venue", "Publisher", "DOI", "Indexing", "Quartile", "Impact Factor", "Citations", "Status", "Submitted At"]


def report_documents(database, year=None, department_id=None, faculty_id=None, topic=None, publication_type=None, publication_status="approved", date_from=None, date_to=None) -> list[dict]:
    if date_from and date_to and date_from > date_to:
        raise HTTPException(status_code=422, detail="Start date must be on or before end date")
    filters = {}
    if publication_status and publication_status != "all":
        filters["status"] = publication_status
    if year:
        filters["publication_year"] = year
    if publication_type:
        filters["publication_type"] = publication_type
    if date_from or date_to:
        filters["submitted_at"] = {}
        if date_from:
            filters["submitted_at"]["$gte"] = datetime.combine(date_from, time.min, UTC)
        if date_to:
            filters["submitted_at"]["$lt"] = datetime.combine(date_to + timedelta(days=1), time.min, UTC)
    profile_filter = {}
    if faculty_id:
        profile_filter["_id"] = object_id(faculty_id, "faculty")
    if department_id:
        profile_filter["department_id"] = object_id(department_id, "department")
    if profile_filter:
        filters["faculty_id"] = {"$in": [item["_id"] for item in database.faculty_profiles.find(profile_filter, {"_id": 1})]}
    if topic:
        term = re.escape(topic.strip())
        topic_faculty = [item["_id"] for item in database.faculty_profiles.find({"research_areas": {"$regex": term, "$options": "i"}}, {"_id": 1})]
        filters["$or"] = [{"title": {"$regex": term, "$options": "i"}}, {"abstract": {"$regex": term, "$options": "i"}}, {"faculty_id": {"$in": topic_faculty}}]
    return enrich_publications(database, list(database.publications.find(filters).sort([("submitted_at", -1), ("_id", -1)])))


def report_summary(docs: list[dict]) -> dict:
    citations = sum(item.get("citation_count", 0) for item in docs)
    yearly = Counter(item["publication_year"] for item in docs)
    yearly_citations = Counter()
    for item in docs:
        yearly_citations[item["publication_year"]] += item.get("citation_count", 0)
    return {
        "total_publications": len(docs),
        "total_citations": citations,
        "average_citations": round(citations / len(docs), 2) if docs else 0,
        "faculty_count": len({item.get("faculty_id") for item in docs}),
        "departments": dict(sorted(Counter(item.get("department_name", "Unknown") for item in docs).items())),
        "types": dict(sorted(Counter(item["publication_type"] for item in docs).items())),
        "statuses": dict(sorted(Counter(item["status"] for item in docs).items())),
        "yearly": [{"year": year, "publications": count, "citations": yearly_citations[year]} for year, count in sorted(yearly.items())],
    }


def report_row(item: dict) -> list:
    values = [item.get("faculty_name", ""), item.get("department_name", ""), item["title"], ", ".join(item.get("authors", [])), item["publication_type"], item["publication_year"], item.get("journal_or_conference", ""), item.get("publisher", ""), item.get("doi", ""), item.get("indexing", ""), item.get("quartile", ""), item.get("impact_factor", 0), item.get("citation_count", 0), item["status"], str(item.get("submitted_at", ""))]
    return ["'" + value if isinstance(value, str) and value.startswith(("=", "+", "-", "@")) else value for value in values]


def build_csv(docs: list[dict]) -> BytesIO:
    output = StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(HEADERS)
    writer.writerows(report_row(item) for item in docs)
    return BytesIO(output.getvalue().encode("utf-8-sig"))


def build_pdf(database, year=None, department_id=None, docs=None) -> BytesIO:
    docs = docs if docs is not None else report_documents(database, year, department_id)
    summary = report_summary(docs)
    stream = BytesIO()
    styles = getSampleStyleSheet()
    story = [Paragraph("Research Publication Analytics Report", styles["Title"]), Spacer(1, 10)]
    story.append(Paragraph(f"Publications: {summary['total_publications']} | Citations: {summary['total_citations']} | Average citations: {summary['average_citations']} | Faculty: {summary['faculty_count']}", styles["BodyText"]))
    story.append(Spacer(1, 12))
    for label, values in (("Status", summary["statuses"]), ("Type", summary["types"]), ("Department", summary["departments"])):
        story.append(Paragraph(f"{label}: {escape(', '.join(f'{key} ({count})' for key, count in values.items()) or 'None')}", styles["BodyText"]))
    story.append(Paragraph("Yearly: " + escape(", ".join(f"{item['year']} ({item['publications']} publications, {item['citations']} citations)" for item in summary["yearly"]) or "None"), styles["BodyText"]))
    story.append(Spacer(1, 14))
    rows = [["#", "Faculty", "Title", "Type", "Year", "Status", "Citations"]]
    for number, item in enumerate(docs, 1):
        rows.append([str(number), Paragraph(escape(item.get("faculty_name", "")), styles["BodyText"]), Paragraph(escape(item["title"]), styles["BodyText"]), item["publication_type"], str(item["publication_year"]), item["status"], str(item.get("citation_count", 0))])
    table = LongTable(rows, colWidths=[25, 105, 290, 70, 40, 55, 45], repeatRows=1)
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), .2, colors.lightgrey), ("FONTSIZE", (0, 0), (-1, -1), 7), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("PADDING", (0, 0), (-1, -1), 4)]))
    story.append(table)
    SimpleDocTemplate(stream, pagesize=landscape(A4), rightMargin=24, leftMargin=24, topMargin=30, bottomMargin=30).build(story)
    stream.seek(0)
    return stream


def build_excel(database, year=None, department_id=None, docs=None) -> BytesIO:
    docs = docs if docs is not None else report_documents(database, year, department_id)
    summary_data = report_summary(docs)
    workbook = Workbook()
    summary = workbook.active
    summary.title = "Summary"
    for label in ("total_publications", "total_citations", "average_citations", "faculty_count"):
        summary.append([label.replace("_", " ").title(), summary_data[label]])
    publications = workbook.create_sheet("Publications")
    publications.append(HEADERS)
    for item in docs:
        publications.append(report_row(item))
    yearly = workbook.create_sheet("Yearly Summary")
    yearly.append(["Year", "Publications", "Citations"])
    for item in summary_data["yearly"]:
        yearly.append([item["year"], item["publications"], item["citations"]])
    header_fill = PatternFill("solid", fgColor="0F766E")
    for sheet in workbook.worksheets:
        for cell in sheet[1]:
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = header_fill
        sheet.freeze_panes = "A2"
        for column in sheet.columns:
            sheet.column_dimensions[column[0].column_letter].width = min(45, max(12, max(len(str(cell.value or "")) for cell in column) + 2))
    stream = BytesIO()
    workbook.save(stream)
    stream.seek(0)
    return stream
