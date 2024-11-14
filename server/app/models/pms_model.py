from pydantic import BaseModel
from typing import Optional, List


# Basic student information for adding a new student
class AddStudent(BaseModel):
    name: str
    email: str
    contact: str
    password: str


# Student login model
class StudentLogin(BaseModel):
    student_id: str
    password: str


# Basic personal details
class BasicDetails(BaseModel):
    full_name: str
    father_name: str
    mother_name: str
    date_of_birth: str
    branch: str


# 10th class details model
class TenthDetails(BaseModel):
    school_location: str
    percentage: float
    board: str
    marksheet_url: str = None
    year_of_passing: int


# 12th class details model
class TwelfthDetails(BaseModel):
    school_location: str
    percentage: float
    board: str
    marksheet_url: str = None
    year_of_passing: int


# Semester details model
class SemesterDetails(BaseModel):
    semester: int
    cgpa: float
    no_backlogs: int
    marksheet_url: str = None


# Comprehensive student details model
class StudentDetails(BaseModel):
    basic_details: BasicDetails
    tenth_details: TenthDetails
    twelfth_details: TwelfthDetails
    semester_details: List[SemesterDetails]
