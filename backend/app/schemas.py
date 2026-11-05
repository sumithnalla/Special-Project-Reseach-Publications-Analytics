from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, HttpUrl, field_validator

PublicationType = Literal["journal", "conference", "book_chapter"]
PublicationStatus = Literal["pending", "approved", "rejected"]
Indexing = Literal["Scopus", "Web of Science", "UGC/Other", "Not Indexed"]
Quartile = Literal["Q1", "Q2", "Q3", "Q4", "N/A"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class ProfileUpdate(BaseModel):
    phone: str = Field(default="", max_length=40)
    research_areas: list[str] = Field(default_factory=list, max_length=8)


class PublicationInput(BaseModel):
    title: str = Field(min_length=5, max_length=300)
    authors: list[str] = Field(min_length=1, max_length=20)
    publication_type: PublicationType
    journal_or_conference: str = Field(min_length=2, max_length=200)
    publisher: str = Field(default="", max_length=150)
    publication_year: int = Field(ge=2020, le=2026)
    doi: str = Field(default="", max_length=150)
    indexing: Indexing
    quartile: Quartile
    impact_factor: float = Field(default=0, ge=0, le=1000)
    citation_count: int = Field(default=0, ge=0)
    url: str = Field(default="", max_length=500)
    abstract: str = Field(default="", max_length=5000)

    @field_validator("authors")
    @classmethod
    def normalize_authors(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values if value.strip()]
        if not cleaned:
            raise ValueError("At least one author is required")
        return cleaned


class FacultyCreate(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    email: EmailStr
    faculty_id: str = Field(min_length=3, max_length=30)
    department_id: str
    designation: str = Field(min_length=2, max_length=100)
    research_areas: list[str] = Field(default_factory=list, max_length=8)
    joining_year: int = Field(ge=1980, le=2026)
    temporary_password: str = Field(min_length=6, max_length=128)


class FacultyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=120)
    department_id: str | None = None
    designation: str | None = Field(default=None, min_length=2, max_length=100)
    research_areas: list[str] | None = Field(default=None, max_length=8)
    joining_year: int | None = Field(default=None, ge=1980, le=2026)
    phone: str | None = Field(default=None, max_length=40)


class StatusUpdate(BaseModel):
    status: Literal["active", "inactive"]


class RejectionRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=1000)
