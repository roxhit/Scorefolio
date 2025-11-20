from pydantic import BaseModel, model_validator, HttpUrl, Field, EmailStr
from typing import List
from datetime import date, datetime
from typing import Optional


class student_register(BaseModel):
    first_name: str
    last_name: str
    email: str
    contact: int
    password: str


class student_login(BaseModel):
    email: str
    password: str


class personal_details(BaseModel):
    first_name: str
    last_name: str
    branch: str
    father_name: str
    mother_name: str
    date_of_birth: date


class TenthDetails(BaseModel):
    school_location: str
    percentage: float
    board: str
    marksheet_url: str = None
    attested_marksheet_url: str = None
    year_of_passing: int


class TwelfthDetails(BaseModel):
    school_location: str
    percentage: float
    board: str
    marksheet_url: str = None
    attested_marksheet_url: str = None
    year_of_passing: int


class SemesterDetails(BaseModel):
    semester: int
    cgpa: float
    no_backlogs: int
    marksheet_url: str = None
    attested_marksheet_url: str = None


class education_details(BaseModel):
    tenth_details: TenthDetails
    twelth_details: TwelfthDetails
    semester_details: List[SemesterDetails]


class InternshipDetails(BaseModel):
    organization: str  # Where the internship was done
    start_date: date  # Start date of the internship
    end_date: date  # End date of the internship
    certificates: Optional[List[str]] = (
        None  # List of certificate names/paths (optional)
    )
    skills: Optional[List[str]] = (
        None  # List of skills acquired during the internship (optional)
    )

    @model_validator(mode="after")
    def check_duration(cls, model: "InternshipDetails") -> "InternshipDetails":
        if model.end_date < model.start_date:
            raise ValueError("End date cannot be before start date.")
        duration = (model.end_date - model.start_date).days
        if duration < 30:
            raise ValueError("Internship duration must be at least 1 month (30 days).")
        return model

    def serialize(self):
        # Convert start_date and end_date to datetime objects
        return {
            "organization": self.organization,
            "start_date": datetime.combine(
                self.start_date, datetime.min.time()
            ),  # Convert to datetime
            "end_date": datetime.combine(
                self.end_date, datetime.min.time()
            ),  # Convert to datetime
            "certificates": self.certificates,
        }


class StudentProfileUpdate(BaseModel):
    # From student_register (excluding password)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    contact: Optional[int] = 0

    # From personal_details
    branch: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    date_of_birth: Optional[date] = None

    # From education_details
    tenth_details: Optional[TenthDetails] = None
    twelth_details: Optional[TwelfthDetails] = None
    semester_details: Optional[List[SemesterDetails]] = None

    # From InternshipDetails (optional list)
    internships: Optional[List[InternshipDetails]] = None


class EmailRequest(BaseModel):
    to: List[str]
    subject: str
    text: str


class JobApplicationCreate(BaseModel):
    resume_link: HttpUrl
    skills: List[str]
    projects: List[str]
    github_profile: Optional[HttpUrl] = None
    portfolio_website: Optional[HttpUrl] = None
    additional_info: Optional[str] = None


class JobApplicationDB(JobApplicationCreate):
    student_id: str
    applied_on: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="Applied")
