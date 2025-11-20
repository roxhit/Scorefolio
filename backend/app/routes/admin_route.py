from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
from app.config.db import (
    admin_collection,
    super_admin_collection,
    student_collection,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_admin,
)
from datetime import timedelta
from app.models.admin_model import AdminLogin, CreateAdmin
from app.utils.super_admin import verify_super_admin  # adjust path accordingly
from bson import ObjectId
from passlib.context import CryptContext

admin_router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@admin_router.post("/create_admin")
async def create_admin(admin: CreateAdmin, super_admin=str):
    # Check if the admin already exists
    super_admin = super_admin_collection.find_one({"_id": ObjectId(super_admin)})
    if not super_admin:
        raise HTTPException(status_code=403, detail="Invalid super admin token")
    existing_admin = admin_collection.find_one({"email": admin.email})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists")
    hashed_password = pwd_context.hash(admin.password)
    # Create new admin
    new_admin = {
        "first_name": admin.first_name,
        "last_name": admin.last_name,
        "email": admin.email,
        "password": hashed_password,  # ❗Consider hashing
        "role": "admin",
    }
    admin_collection.insert_one(new_admin)
    return {"message": "Admin created successfully"}


@admin_router.post("/admin-login")
async def admin_login(admin: AdminLogin):
    # Check if the admin exists
    existing_admin = admin_collection.find_one({"email": admin.admin_email})
    if not existing_admin:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Verify password
    if not pwd_context.verify(admin.admin_password, existing_admin["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Generate JWT token using admin email as 'sub'
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    admin_access_token = create_access_token(
        data={"sub": admin.admin_email},  # email will be used in get_current_admin
        expires_delta=access_token_expires,
    )

    return {
        "admin_email": existing_admin["email"],
        "first_name": existing_admin["first_name"],
        "last_name": existing_admin["last_name"],
        "admin_access_token": admin_access_token,  # Changed from admin_access_token
        "admin_id": str(existing_admin["_id"]),  # Added admin_id
        "role": existing_admin.get("role", "admin"),  # Added role
        "token_type": "bearer",
        "message": "Admin login successful",
    }


@admin_router.get("/get-all-students")
async def get_all_students():
    try:
        students_cursor = student_collection.find()
        students = []
        for student in students_cursor:
            student["_id"] = str(student["_id"])  # Convert ObjectId to string for JSON
            students.append(student)
        return {
            "students": students,
            "total_students": len(students),
            "total_students_placed": len(
                [s for s in students if s.get("status") == "placed"]
            ),
            "placement_rate": (
                len([s for s in students if s.get("status") == "placed"])
                / len(students)
                * 100
                if students
                else 0
            ),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@admin_router.get("/admin/profile")
async def get_admin_profile(current_admin: dict = Depends(get_current_admin)):
    try:
        admin_email = current_admin.get("email")

        if not admin_email:
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Fetch admin profile using updated model fields
        admin_data = admin_collection.find_one(
            {"email": admin_email}, {"_id": 0, "password": 0}
        )

        if not admin_data:
            raise HTTPException(status_code=404, detail="Admin not found")

        return {
            "profile": {
                "first_name": admin_data.get("first_name", ""),
                "last_name": admin_data.get("last_name", ""),
                "admin_email": admin_data.get("email", ""),
                "role": admin_data.get("role", ""),
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@admin_router.get("/view-resume")
async def view_resume(
    student_id: str, current_admin: dict = Depends(get_current_admin)
):
    try:
        # Convert string to ObjectId if it's not already
        try:
            object_id = ObjectId(student_id)
        except:
            raise HTTPException(status_code=422, detail="Invalid student ID format")

        student = student_collection.find_one({"_id": object_id})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Convert ObjectId to string for JSON serialization
        student_dict = {
            "student_id": str(student.get("_id")),
            "first_name": student.get("first_name", ""),
            "last_name": student.get("last_name", ""),
            "email": student.get("email", ""),
            "course": student.get("course", ""),
            "resume_url": student.get("resume_link", None),
        }

        # Return in the format expected by the frontend
        return {"status": "success", "student_details": student_dict}
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        print(f"Error in view_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@admin_router.get("/view-profile")
async def view_details(
    student_id: str, current_admin: dict = Depends(get_current_admin)
):
    try:
        student = student_collection.find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Convert ObjectId to string
        student["_id"] = str(student["_id"])
        return {"student_details": student}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@admin_router.put("/grant-edit-access")
async def grant_profile_edit_access(
    allow: bool = Query(True, description="Grant (true) or revoke (false) access"),
    all_students: bool = Query(False, description="Apply to all students"),
    student_ids: List[str] = Body(default=None, description="List of student_ids"),
    current_admin: dict = Depends(get_current_admin),
):
    admin_email = current_admin.get("email")

    if not admin_email:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if all_students:
        result = student_collection.update_many(
            {}, {"$set": {"can_edit_profile": allow}}
        )
        return {
            "message": f"Profile edit access {'granted' if allow else 'revoked'} for all students",
            "targeted_students": "all",
            "modified_count": result.modified_count,
        }

    # Case 2: No student_ids provided
    if not student_ids:
        raise HTTPException(
            status_code=400, detail="Provide student_ids or set all_students=true"
        )

    # Case 3: Check which student_ids exist
    existing_students_cursor = student_collection.find(
        {"student_id": {"$in": student_ids}}, {"student_id": 1}
    )
    existing_student_ids = [
        student["student_id"] for student in existing_students_cursor
    ]

    # Find invalid ones
    invalid_ids = list(set(student_ids) - set(existing_student_ids))
    if not existing_student_ids:
        raise HTTPException(
            status_code=404, detail="None of the student_ids were found"
        )

    # Perform update
    result = student_collection.update_many(
        {"student_id": {"$in": existing_student_ids}},
        {"$set": {"can_edit_profile": allow}},
    )

    return {
        "message": f"Profile edit access {'granted' if allow else 'revoked'}",
        "targeted_students": existing_student_ids,
        "invalid_student_ids": invalid_ids,
        "modified_count": result.modified_count,
    }


@admin_router.get("/dashboard-stats")
async def get_dashboard_stats(current_admin: dict = Depends(get_current_admin)):
    try:
        # Get total number of students
        total_students = student_collection.count_documents({})

        # Get total number of placed students
        total_placed_students = student_collection.count_documents({"status": "placed"})

        # Calculate placement rate
        placement_rate = (
            (total_placed_students / total_students * 100) if total_students > 0 else 0
        )

        active_companies = admin_collection.count_documents({"status": "active"})
        total_companies = admin_collection.count_documents({})
        return {
            "total_students": total_students,
            "total_placed_students": total_placed_students,
            "placement_rate": placement_rate,
            "active_companies": active_companies,
            "total_companies": total_companies,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
