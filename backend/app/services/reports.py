from io import BytesIO

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.services.data import approved_analytics, enrich_publications


def report_documents(database, year: int | None = None, department_id=None) -> list[dict]:
    filters: dict = {"status": "approved"}
    if year:
        filters["publication_year"] = year
    if department_id:
        faculty_ids = [item["_id"] for item in database.faculty_profiles.find({"department_id": department_id}, {"_id": 1})]
        filters["faculty_id"] = {"$in": faculty_ids}
    return list(database.publications.find(filters).sort([("publication_year", -1), ("title", 1)]))


def build_pdf(database, year: int | None = None, department_id=None) -> BytesIO:
    stream = BytesIO()
    docs = report_documents(database, year, department_id)
    analytics = approved_analytics(database, {"publication_year": year} if year else {})
    styles = getSampleStyleSheet()
    story = [Paragraph("Research Publication Analytics Report", styles["Title"]), Spacer(1, 10)]
    story.append(Paragraph(f"Approved publications: {len(docs)} | Total citations: {analytics['overview']['total_citations']} | Average citations: {analytics['overview']['average_citations']}", styles["BodyText"]))
    story.append(Spacer(1, 12))
    summary = [["Year", "Publications", "Citations"]] + [[str(item["year"]), str(item["publications"]), str(item["citations"])] for item in analytics["yearly"]]
    table = Table(summary, colWidths=[1.4 * inch, 1.5 * inch, 1.5 * inch])
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.25, colors.grey), ("PADDING", (0, 0), (-1, -1), 6)]))
    story += [Paragraph("Publication Trends", styles["Heading2"]), table, Spacer(1, 14)]
    publication_rows = [["Title", "Type", "Year", "Indexing", "Citations"]] + [[item["title"][:55], item["publication_type"], str(item["publication_year"]), item["indexing"], str(item["citation_count"])] for item in docs[:100]]
    publication_table = Table(publication_rows, colWidths=[3.2 * inch, 0.8 * inch, 0.5 * inch, 1.0 * inch, 0.55 * inch], repeatRows=1)
    publication_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#164e63")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.2, colors.lightgrey), ("FONTSIZE", (0, 0), (-1, -1), 7), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("PADDING", (0, 0), (-1, -1), 4)]))
    story += [Paragraph("Approved Publications", styles["Heading2"]), publication_table]
    SimpleDocTemplate(stream, pagesize=A4, rightMargin=24, leftMargin=24, topMargin=30, bottomMargin=30).build(story)
    stream.seek(0)
    return stream


def build_excel(database, year: int | None = None, department_id=None) -> BytesIO:
    docs = report_documents(database, year, department_id)
    enriched = enrich_publications(database, docs)
    analytics = approved_analytics(database, {"publication_year": year} if year else {})
    workbook = Workbook()
    summary = workbook.active
    summary.title = "Summary"
    summary.append(["Research Publication Analytics Report"])
    summary.append(["Approved Publications", analytics["overview"]["total_publications"]])
    summary.append(["Total Citations", analytics["overview"]["total_citations"]])
    summary.append(["Average Citations", analytics["overview"]["average_citations"]])
    publications = workbook.create_sheet("Publications")
    publications.append(["Faculty", "Department", "Title", "Authors", "Type", "Year", "Venue", "Publisher", "DOI", "Indexing", "Quartile", "Impact Factor", "Citations", "Status"])
    for item in enriched:
        publications.append([item.get("faculty_name", ""), item.get("department_name", ""), item["title"], ", ".join(item["authors"]), item["publication_type"], item["publication_year"], item["journal_or_conference"], item["publisher"], item["doi"], item["indexing"], item["quartile"], item["impact_factor"], item["citation_count"], item["status"]])
    yearly = workbook.create_sheet("Yearly Summary")
    yearly.append(["Year", "Publications", "Citations"])
    for item in analytics["yearly"]:
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
