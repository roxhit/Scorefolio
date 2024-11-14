from fastapi import APIRouter, HTTPException
from app.config.db import *
from app.models.admin_model import *

adminRouter = APIRouter()


@adminRouter.post("/admin-register")
async def admin_register(admin_details: AdminDetails):
    admin_present = admin_collection.find_one({"email": admin_details.admin_email})
    if admin_present:
        raise HTTPException(status_code=409, detail="email already exists")
    if len(str(admin_details.admin_contact)) != 10:
        raise HTTPException(status_code=400, detail="phone no is not of 10 digits")
    if len(admin_details.admin_password) < 7:
        raise HTTPException(
            status_code=400, detail="Password must be at least 7 characters long"
        )

    inserted_id = admin_collection.insert_one(dict(admin_details)).inserted_id
    return {"message": "data insert successfully", "admin_id": str(inserted_id)}
