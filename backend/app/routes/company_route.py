from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from app.models.company_model import AddCompany, UpdateCompany
from app.config.db import (
    company_collection,
    get_current_admin,
    company_application_collection,
    student_collection,
)  # Assuming you have an admin auth dependency
from datetime import datetime
from datetime import date
import cloudinary
import cloudinary.uploader
from bson import ObjectId

company_router = APIRouter()


@company_router.post("/add-company")
def add_company(company: AddCompany, current_admin: dict = Depends(get_current_admin)):
    serialized = company.serialize()
    print("Received company data:", serialized)
    result = company_collection.insert_one(serialized)
    return {
        "message": "Company added successfully",
        "company_id": str(result.inserted_id),
    }


@company_router.put("/upload-documents/{company_id}")
async def upload_documents(
    company_id: str,
    files: list[UploadFile] = File(...),
    current_admin: dict = Depends(get_current_admin),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    uploaded_urls = []
    for file in files:
        # Upload to Cloudinary as raw file
        upload_result = cloudinary.uploader.upload(
            file.file,
            resource_type="raw",
            folder="company_docs",  # optional folder organization
            public_id=f"{company_id}/{file.filename}",  # unique filename
        )
        uploaded_urls.append(upload_result["secure_url"])

    # Update MongoDB
    result = company_collection.update_one(
        {"_id": ObjectId(company_id)},
        {"$push": {"related_documents": {"$each": uploaded_urls}}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Company not found")

    return {"message": "Documents uploaded successfully", "files": uploaded_urls}


@company_router.get("/get-all-companies")
def get_all_companies():
    companies = list(company_collection.find())

    for company in companies:
        company["_id"] = str(company["_id"])

    # Sort: first companies where status is not "closed", then "closed" ones
    sorted_companies = sorted(companies, key=lambda x: x.get("status") == "Closed")

    return {
        "companies": sorted_companies,
        "company_visited": len(companies),
        "highest_package": max(
            [company["package"] for company in companies], default=0
        ),
        "average_package": (
            sum([company["package"] for company in companies]) / len(companies)
            if companies
            else 0
        ),
    }


@company_router.get("/get-company/{company_id}")
def get_company(company_id: str):
    company = company_collection.find_one({"_id": ObjectId(company_id)})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company["_id"] = str(company["_id"])
    return company


@company_router.put("/update-company/{company_id}")
def update_company(
    company_id: str,
    company: UpdateCompany,
    current_admin: dict = Depends(get_current_admin),
):
    company_data = company.serialize()
    result = company_collection.update_one(
        {"_id": ObjectId(company_id)}, {"$set": company_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"message": "Company updated successfully"}


@company_router.get("/view-all-applications/{company_id}")
def view_all_applications(company_id: str):
    # 1. Get the company
    company = company_collection.find_one({"_id": ObjectId(company_id)})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # 2. Get application IDs from company
    application_ids = company.get("applications", [])

    # 3. Find applications and extract student_ids
    applications = list(
        company_application_collection.find(
            {"_id": {"$in": [ObjectId(app_id) for app_id in application_ids]}}
        )
    )
    student_ids = [app["student_id"] for app in applications]

    # 4. Fetch student details
    students = list(student_collection.find({"student_id": {"$in": student_ids}}))

    # 5. Format student info
    student_infos = [
        {
            "first_name": student.get("first_name"),
            "last_name": student.get("last_name"),
            "branch": student.get("branch"),
            "student_id": student.get("student_id"),
        }
        for student in students
    ]

    return {
        "company_name": company.get("company_name"),
        "applications_count": len(student_infos),
        "applicants": student_infos,
    }
