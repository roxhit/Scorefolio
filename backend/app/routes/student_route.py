from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from app.models.student_model import (
    student_register,
    student_login,
    personal_details,
    EmailRequest,
    education_details,
    InternshipDetails,
    JobApplicationCreate,
    JobApplicationDB,
    StudentProfileUpdate,
)
from typing import List
import cloudinary
import cloudinary.uploader
from app.config.db import (
    student_collection,
    company_application_collection,
    company_collection,
    resource_collection,
    activity_logs_collection,
    RESEND_API_KEY,
    FROM_EMAIL,
    get_current_user,
    create_access_token,
)
import random
import re
from passlib.context import CryptContext
import resend
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, date
from bson import ObjectId
from cloudinary.uploader import upload
from cloudinary.exceptions import Error as CloudinaryError
from app.utils.activity_logs import log_activity
import json

student_route = APIRouter(tags=["Student"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Secret key for JWT
SECRET_KEY = "rohitsingh"  # Change this to a random secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


@student_route.post("/student-register")
async def student_register_route(student: student_register):
    try:
        # Check if the student with the same email already exists
        student_present = student_collection.find_one({"email": student.email})
        if student_present:
            raise HTTPException(
                status_code=400, detail="Student with that email already exists"
            )

        # Validate email format
        if not re.search(r"(\w{1,})@([a-z]+).([a-z]+)", student.email):
            raise HTTPException(status_code=400, detail="Invalid Email Address")

        # Validate contact number length (e.g., must be 10 digits)
        if len(str(student.contact)) != 10 or not str(student.contact).isnumeric():
            raise HTTPException(
                status_code=400, detail="Invalid Contact Number. Must be 10 digits."
            )

        # Hash the password before saving it
        hashed_password = pwd_context.hash(student.password)

        # Generate a 12-digit student ID starting with 'SSGI20'
        student_id = "SSGI20" + str(
            random.randint(100000, 999999)
        )  # Remaining 6 digits

        # Create new student entry
        new_student = {
            "student_id": student_id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email,
            "password": hashed_password,  # Store the hashed password
            "contact": student.contact,
            "registered_through": "form",
            "current_step": 1,
            "is_step_completed": False,
            "role": "student",
            "status": "unplaced",
            "can_edit_profile": False,
        }

        # Insert the student into the database
        student_collection.insert_one(new_student)

        return {
            "message": "Student registered successfully",
            "student_id": student_id,
            "access_token": create_access_token(data={"sub": student_id}),
            "current_step": 1,
            "is_step_completed": False,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@student_route.post("/google-register")
async def google_register_route(student: student_register):
    pass


@student_route.post("/login")
async def student_login_route(student: student_login):
    try:
        # Check if the student with the provided email exists
        student_present = student_collection.find_one({"email": student.email})
        if not student_present:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        # Verify the password
        if not pwd_context.verify(student.password, student_present["password"]):
            raise HTTPException(status_code=400, detail="Invalid email or password")

        # Generate JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": student_present["student_id"]},
            expires_delta=access_token_expires,
        )

        return {
            "message": "Login Successful",
            "access_token": access_token,
            "token_type": "bearer",
            "current_step": student_present["current_step"],
            "is_step_completed": student_present["is_step_completed"],
            "student_id": student_present["student_id"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@student_route.put("/update-personal-details")
async def update_personal_details_route(
    personal_data: personal_details,
    current_student: dict = Depends(get_current_user),
):
    try:
        student_id = current_student.get("student_id")
        # Check if student exists
        student = student_collection.find_one({"student_id": student_id})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Update personal details
        student_collection.update_one(
            {"student_id": student_id},
            {
                "$set": {
                    "first_name": personal_data.first_name,
                    "last_name": personal_data.last_name,
                    "father_name": personal_data.father_name,
                    "mother_name": personal_data.mother_name,
                    "date_of_birth": datetime.combine(
                        personal_data.date_of_birth, datetime.min.time()
                    ),
                    "branch": personal_data.branch,
                    "current_step": 2,
                }
            },
        )
        log_activity(
            student_id,
            action="Updated personal details",
            route="/update-personal-details",
            metadata={
                "updated_fields": [
                    "first_name",
                    "last_name",
                    "father_name",
                    "mother_name",
                    "date_of_birth",
                    "branch",
                ]
            },
        )

        return {"message": "Personal details updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@student_route.put("/update-education-details")
async def update_education_route(
    education_data: education_details,
    current_student: dict = Depends(get_current_user),
):
    try:
        student_id = current_student.get("student_id")

        # Check if student exists
        student = student_collection.find_one({"student_id": student_id})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Convert semester details to list of dicts
        semester_details_dicts = [sem.dict() for sem in education_data.semester_details]

        # Calculate overall CGPA
        total_cgpa = 0
        cgpa_count = 0
        for sem in semester_details_dicts:
            if "cgpa" in sem and isinstance(sem["cgpa"], (int, float)):
                total_cgpa += sem["cgpa"]
                cgpa_count += 1

        if cgpa_count == 0:
            raise HTTPException(
                status_code=400, detail="No valid CGPA found in semester details"
            )

        overall_cgpa = round(total_cgpa / cgpa_count, 2)
        tenth_percentage = education_data.tenth_details.percentage
        twelfth_percentage = education_data.twelth_details.percentage
        has_backlogs = any(
            [sem.get("backlogs", 0) > 0 for sem in semester_details_dicts]
        )

        is_eligible = (
            overall_cgpa >= 6.0
            and tenth_percentage >= 60
            and twelfth_percentage >= 60
            and not has_backlogs
        )
        # Update education details in the database
        student_collection.update_one(
            {"student_id": student_id},
            {
                "$set": {
                    "tenth_details": education_data.tenth_details.dict(),
                    "twelfth_details": education_data.twelth_details.dict(),
                    "semester_details": semester_details_dicts,
                    "overall_cgpa": overall_cgpa,
                    "current_step": 3,
                    "is_eligible": is_eligible,
                }
            },
        )

        # Log activity
        log_activity(
            student_id=student_id,
            action="Updated education details",
            route="/update-education-details",
            metadata={
                "updated_fields": [
                    "tenth_details",
                    "twelfth_details",
                    "semester_details",
                    "overall_cgpa",
                ]
            },
        )

        return {
            "message": "Education details updated successfully",
            "overall_cgpa": overall_cgpa,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@student_route.put("/upload-marksheets")
async def upload_marksheets(
    tenth_marksheet: UploadFile = File(None),
    twelfth_marksheet: UploadFile = File(None),
    semester_marksheets: List[UploadFile] = File(None),
    tenth_attested_marksheet: UploadFile = File(None),
    twelfth_attested_marksheet: UploadFile = File(None),
    semester_attested_marksheets: List[UploadFile] = File(None),
    student_id: str = Depends(get_current_user),
):
    try:
        # Validate student_id
        if (
            not student_id
            or not isinstance(student_id, dict)
            or "_id" not in student_id
        ):
            raise HTTPException(status_code=401, detail="Unauthorized")

        student_id_value = student_id["_id"]
        print(f"Received student _id: {student_id_value}")

        def is_valid_file(file):
            return file and hasattr(file, "filename") and file.filename

        def upload_file(file, folder_name):
            try:
                file.file.seek(0)
                return upload(file.file, resource_type="auto", folder=folder_name)[
                    "secure_url"
                ]
            except Exception as e:
                print(f"Error uploading file {file.filename}: {str(e)}")
                return None

        update_fields = {}

        # Handle simple 10th & 12th files
        if is_valid_file(tenth_marksheet):
            url = upload_file(tenth_marksheet, "MajorProject/10th")
            if url:
                update_fields["tenth_details.marksheet_url"] = url

        if is_valid_file(twelfth_marksheet):
            url = upload_file(twelfth_marksheet, "MajorProject/12th")
            if url:
                update_fields["twelfth_details.marksheet_url"] = url

        if is_valid_file(tenth_attested_marksheet):
            url = upload_file(tenth_attested_marksheet, "MajorProject/10th/Attested")
            if url:
                update_fields["tenth_details.attested_marksheet_url"] = url

        if is_valid_file(twelfth_attested_marksheet):
            url = upload_file(twelfth_attested_marksheet, "MajorProject/12th/Attested")
            if url:
                update_fields["twelfth_details.attested_marksheet_url"] = url

        # Fetch current semester_details from MongoDB
        student = student_collection.find_one({"_id": ObjectId(student_id_value)})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        semester_details = student.get("semester_details", [])

        # Ensure the list has enough entries
        max_len = max(
            len(semester_marksheets or []), len(semester_attested_marksheets or [])
        )
        while len(semester_details) < max_len:
            semester_details.append({})

        # Handle regular semester marksheets
        if semester_marksheets:
            for i, file in enumerate(semester_marksheets):
                if is_valid_file(file):
                    url = upload_file(file, "MajorProject/Semesters")
                    if url:
                        semester_details[i]["marksheet_url"] = url

        # Handle attested semester marksheets
        if semester_attested_marksheets:
            for i, file in enumerate(semester_attested_marksheets):
                if is_valid_file(file):
                    url = upload_file(file, "MajorProject/Semesters/Attested")
                    if url:
                        semester_details[i]["attested_marksheet_url"] = url

        # Update semester_details in full
        update_fields["semester_details"] = semester_details

        if not update_fields:
            raise HTTPException(
                status_code=400, detail="No valid files provided for upload"
            )

        # Perform the update
        print(f"Update Fields: {update_fields}")
        result = student_collection.update_one(
            {"_id": ObjectId(student_id_value)},
            {"$set": update_fields},
        )
        print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Student not found")

        # Prepare response
        response_data = {
            "message": "Marksheets uploaded and URLs saved successfully",
            "marksheet_urls": {
                "tenth_marksheet_url": update_fields.get("tenth_details.marksheet_url"),
                "twelfth_marksheet_url": update_fields.get(
                    "twelfth_details.marksheet_url"
                ),
                "tenth_attested_marksheet_url": update_fields.get(
                    "tenth_details.attested_marksheet_url"
                ),
                "twelfth_attested_marksheet_url": update_fields.get(
                    "twelfth_details.attested_marksheet_url"
                ),
                "semester_marksheets_urls": [
                    sem.get("marksheet_url") for sem in semester_details
                ],
                "semester_attested_marksheets_urls": [
                    sem.get("attested_marksheet_url") for sem in semester_details
                ],
            },
        }

        log_activity(
            student_id=str(student_id_value),
            action="Uploaded marksheets",
            route="/upload-marksheets",
            metadata={
                "uploaded": {
                    "tenth": "tenth_details.marksheet_url" in update_fields,
                    "twelfth": "twelfth_details.marksheet_url" in update_fields,
                    "semester_count": len(
                        [s for s in semester_details if "marksheet_url" in s]
                    ),
                    "attested_tenth": "tenth_details.attested_marksheet_url"
                    in update_fields,
                    "attested_twelfth": "twelfth_details.attested_marksheet_url"
                    in update_fields,
                    "attested_semester_count": len(
                        [s for s in semester_details if "attested_marksheet_url" in s]
                    ),
                }
            },
        )

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@student_route.put("/add-internship-with-certificates", tags=["Internship"])
async def add_internship_with_certificates(
    organization: str = Form(...),
    start_date: str = Form(...),
    end_date: str = Form(...),
    skills: str = Form(default="[]"),  # JSON string of skills array
    files: List[UploadFile] = File(default=[]),
    current_student: dict = Depends(get_current_user),
):
    student_id = current_student.get("student_id")
    if not student_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Parse skills from JSON string
    try:
        skills_list = json.loads(skills) if skills else []
    except json.JSONDecodeError:
        skills_list = []

    # Upload certificates if any
    certificate_urls = []
    if files:

        def upload_file(file_obj, *, folder):
            return cloudinary.uploader.upload(
                file_obj, resource_type="auto", folder=folder
            )

        for file in files:
            try:
                result = upload_file(file.file, folder="certificates")
                certificate_urls.append(result.get("secure_url"))
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"Cloudinary error: {str(e)}"
                )

    # Create internship object
    serialized_internship = {
        "organization": organization,
        "start_date": datetime.strptime(start_date, "%Y-%m-%d"),
        "end_date": datetime.strptime(end_date, "%Y-%m-%d"),
        "certificates": certificate_urls,
        "skills": skills_list,
    }

    # Add to database
    result = student_collection.update_one(
        {"student_id": student_id},
        {
            "$push": {"internship_details": serialized_internship},
            "can_edit_profile": False,
        },
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=404, detail="Student not found or update failed"
        )

    log_activity(
        student_id=student_id,
        action="Added internship with certificates",
        route="/add-internship-with-certificates",
        metadata={
            "organization": organization,
            "duration": f"{start_date} to {end_date}",
            "skills": skills_list,
            "certificates_count": len(certificate_urls),
        },
    )

    return {
        "message": "Internship added successfully with certificates",
        "certificate_urls": certificate_urls,
    }


@student_route.get("/profile")
async def get_student_profile(current_student: dict = Depends(get_current_user)):
    try:
        student_id = current_student.get("student_id")

        if not student_id:
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Fetch student document from MongoDB
        student_data = student_collection.find_one(
            {"student_id": student_id}, {"_id": 0}
        )  # Exclude MongoDB _id

        if not student_data:
            raise HTTPException(status_code=404, detail="Student profile not found")

        return {"profile": student_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@student_route.post("/send-email")
async def send_email(email_request: EmailRequest):
    try:
        # Set the API key on the resend module
        resend.api_key = RESEND_API_KEY

        # Create the email parameters (note "from" is a reserved keyword)
        email_params = {
            "from": FROM_EMAIL,
            "to": email_request.to,  # Ensure 'to' is a list
            "subject": email_request.subject,
            "text": email_request.text,
        }

        # Send email using the Resend SDK
        response = resend.Emails.send(email_params)

        return {"message": "Email sent successfully", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@student_route.post("/apply-job")
def apply_for_job(
    company_id: str,
    application: JobApplicationCreate,
    current_user: dict = Depends(get_current_user),
):
    student_id = current_user["student_id"]

    # Validate company exists
    company_present = company_collection.find_one({"_id": ObjectId(company_id)})
    if not company_present:
        raise HTTPException(status_code=404, detail="Company not found")

    # Prevent duplicate applications
    existing = company_application_collection.find_one(
        {"student_id": student_id, "company_id": company_id}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job.")

    # Create job application document
    job_app = JobApplicationDB(**application.dict(), student_id=student_id)
    new_application = job_app.dict()
    new_application["resume_link"] = str(job_app.resume_link)
    new_application["github_profile"] = str(job_app.github_profile)
    new_application["portfolio_website"] = str(job_app.portfolio_website)
    new_application["applied_on"] = datetime.utcnow()
    new_application["status"] = "Applied"
    new_application["company_id"] = company_id

    inserted = company_application_collection.insert_one(new_application)
    application_id = str(inserted.inserted_id)

    # Update student document
    student_collection.update_one(
        {"student_id": student_id},
        {"$addToSet": {"companies_applied": company_id}},
    )

    # Update company document
    company_collection.update_one(
        {"_id": ObjectId(company_id)},
        {"$addToSet": {"applications": application_id}},
    )

    # Log activity
    log_activity(
        student_id=student_id,
        action="Applied for job",
        route="/apply-job",
        metadata={
            "application_id": application_id,
            "company_id": company_id,
            "resume_link": str(job_app.resume_link),
            "github_profile": str(job_app.github_profile),
            "portfolio_website": str(job_app.portfolio_website),
        },
    )

    return {"message": "Application submitted successfully."}


@student_route.get("/my-applications")
def get_applied_companies(current_user: dict = Depends(get_current_user)):
    student_id = current_user["student_id"]

    student = student_collection.find_one({"student_id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    applied_company_ids = student.get("companies_applied", [])

    if not applied_company_ids:
        return {"applications": []}

    # Convert string ids to ObjectIds
    company_object_ids = [ObjectId(cid) for cid in applied_company_ids]

    companies = list(company_collection.find({"_id": {"$in": company_object_ids}}))

    result = []
    for company in companies:
        result.append(
            {
                "company_name": company.get("company_name"),
                "role": company.get("role"),
                "location": company.get("location"),
                "status": company.get("status"),
                "package": company.get("package"),
                "apply_before": company.get("apply_before"),
            }
        )

    return {"applications": result}


@student_route.get("/resources")
def get_all_resources():
    try:
        resources = []
        for resource in resource_collection.find():
            resources.append(
                {
                    "id": str(resource["_id"]),
                    "name": resource.get("name"),
                    "category": resource.get("category"),
                    "link": resource.get("link"),
                    "description": resource.get("description"),
                    "type": resource.get("type"),
                }
            )
        return {"resources": resources}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching resources: {str(e)}"
        )


@student_route.post("/upload-resume", tags=["Resume"])
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    # Check file type
    if not file.filename.endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    try:
        # Upload to Cloudinary
        result = upload(
            file.file,
            folder="resumes",
            resource_type="raw",  # for documents
            public_id=f"{current_user['student_id']}_{datetime.now().timestamp()}",
        )

        resume_url = result.get("secure_url")
        if not resume_url:
            raise HTTPException(status_code=500, detail="Upload failed")

        # Optionally: update student profile with resume_url
        student_collection.update_one(
            {"student_id": current_user["student_id"]},
            {"$set": {"resume_link": resume_url}},
        )

        return {"message": "Resume uploaded successfully", "resume_url": resume_url}

    except CloudinaryError as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary error: {str(e)}")


@student_route.get("/get-resume", tags=["Resume"])
async def get_resume(current_user: dict = Depends(get_current_user)):
    student_id = current_user.get("student_id")

    if not student_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    student_data = student_collection.find_one(
        {"student_id": student_id}, {"_id": 0, "resume_link": 1}
    )

    if not student_data or "resume_link" not in student_data:
        raise HTTPException(status_code=404, detail="Resume not found")

    return {"resume_url": student_data["resume_link"]}


@student_route.get("/my-activities", tags=["Activity Logs"])
def get_my_activity_logs(current_user: dict = Depends(get_current_user)):
    student_id = current_user.get("student_id")
    if not student_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    logs = list(
        activity_logs_collection.find(
            {"student_id": student_id},
            {"_id": 0},  # Optional: remove MongoDB's _id from response
        ).sort("timestamp", -1)
    )  # Most recent first

    return {"activities": logs}


@student_route.put("/update-profile")
async def update_student_profile(
    profile_update: StudentProfileUpdate,
    current_student: dict = Depends(get_current_user),
):
    student_id = current_student.get("student_id")

    if not student_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Fetch student profile to check permission
    student = student_collection.find_one({"student_id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if student is allowed to update profile
    if not student.get("can_edit_profile", False):
        return {"message": "Admin has not given access to update the profile."}

    # Prepare update data and exclude unset fields
    update_data = profile_update.dict(exclude_unset=True)

    # Convert date_of_birth to datetime
    if "date_of_birth" in update_data and isinstance(
        update_data["date_of_birth"], date
    ):
        update_data["date_of_birth"] = datetime.combine(
            update_data["date_of_birth"], datetime.min.time()
        )

    # Convert internship dates to datetime
    if "internships" in update_data:
        for internship in update_data["internships"]:
            if isinstance(internship.get("start_date"), date):
                internship["start_date"] = datetime.combine(
                    internship["start_date"], datetime.min.time()
                )
            if isinstance(internship.get("end_date"), date):
                internship["end_date"] = datetime.combine(
                    internship["end_date"], datetime.min.time()
                )

    # Update the student profile in the database
    result = student_collection.update_one(
        {"student_id": student_id}, {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=404, detail="Student not found or no changes made"
        )

    log_activity(
        student_id=student_id,
        action="Updated profile",
        route="/update-profile",
        metadata={"updated_fields": list(update_data.keys())},
    )

    return {"message": "Profile updated successfully"}
