# from pymongo import MongoClient
# from passlib.context import CryptContext
# from bson import ObjectId
# from datetime import datetime

# # MongoDB setup (change URI/DB/collection if needed)
# client = MongoClient(
#     "mongodb+srv://rohitsingh692004:gItvbSL4gGwtlXEb@cluster0.tac6wmj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# )
# db = client["major_project"]
# user_collection = db["super_admin_collection"]

# # Password hashing
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # SuperAdmin data
# superadmin_email = "superadmin@example.com"
# superadmin_password = "supersecurepassword"

# # Check if superadmin already exists
# existing_admin = user_collection.find_one({"email": superadmin_email})
# if existing_admin:
#     print(f"SuperAdmin with email {superadmin_email} already exists.")
# else:
#     hashed_password = pwd_context.hash(superadmin_password)
#     superadmin_data = {
#         "_id": ObjectId(),
#         "email": superadmin_email,
#         "password": hashed_password,
#         "role": "superadmin",
#         "created_at": datetime.utcnow(),
#     }

#     user_collection.insert_one(superadmin_data)
#     print(f"SuperAdmin {superadmin_email} created successfully!")


from fastapi import Header, HTTPException, Depends
from app.config.db import super_admin_collection


async def verify_super_admin(token: str = Header(...)):
    super_admin = super_admin_collection.find_one({"token": token})
    if not super_admin:
        raise HTTPException(status_code=403, detail="Invalid super admin token")
    return super_admin
