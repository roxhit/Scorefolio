from pydantic import BaseModel, HttpUrl, Field, field_validator
from typing import Optional, List
from datetime import date, datetime


class AddCompany(BaseModel):
    company_name: str
    role: str
    short_description: str
    detailed_description: str
    location: str
    package: int
    apply_before: date
    related_documents: Optional[List[HttpUrl]] = []
    company_website: Optional[HttpUrl] = None
    status: Optional[str] = "Coming Soon"
    eligibility: Optional[float] = None

    @field_validator("apply_before", mode="before")
    def validate_apply_before(cls, v):
        if isinstance(v, str):
            return datetime.strptime(v, "%Y-%m-%d").date()
        return v

    def serialize(self):
        return {
            "company_name": self.company_name,
            "role": self.role,
            "short_description": self.short_description,
            "detailed_description": self.detailed_description,
            "location": self.location,
            "package": self.package,
            "apply_before": datetime.combine(self.apply_before, datetime.min.time()),
            "related_documents": [str(url) for url in self.related_documents],
            "company_website": (
                str(self.company_website) if self.company_website else None
            ),
            "status": "Closed" if self.apply_before < date.today() else self.status,
            "eligibility": self.eligibility,
        }


class UpdateCompany(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None
    location: Optional[str] = None
    package: Optional[int] = None
    apply_before: Optional[date] = None
    related_documents: Optional[List[HttpUrl]] = Field(default_factory=list)
    company_website: Optional[HttpUrl] = None
    status: Optional[str] = "Coming Soon"
    eligibility: Optional[float] = None

    @field_validator("apply_before", mode="before")
    def validate_apply_before(cls, v):
        if isinstance(v, str):
            return datetime.strptime(v, "%Y-%m-%d").date()
        return v

    def serialize(self):
        return {
            "company_name": self.company_name,
            "role": self.role,
            "short_description": self.short_description,
            "detailed_description": self.detailed_description,
            "location": self.location,
            "package": self.package,
            "apply_before": datetime.combine(self.apply_before, datetime.min.time()),
            "related_documents": [str(url) for url in self.related_documents],
            "company_website": (
                str(self.company_website) if self.company_website else None
            ),
            "status": "Closed" if self.apply_before < date.today() else self.status,
            "eligibility": self.eligibility,
        }
