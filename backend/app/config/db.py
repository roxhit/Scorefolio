from pymongo import MongoClient
import os
import cloudinary
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from typing import Optional
import jwt
from datetime import timedelta, datetime

MONGO_URL = "mongodb+srv://rohitsingh692004:gItvbSL4gGwtlXEb@cluster0.tac6wmj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URL)

database = client.major_project
student_collection = database["student_collection"]
admin_collection = database["admin_collection"]
super_admin_collection = database["super_admin_collection"]
company_collection = database["company_collection"]
company_application_collection = database["company_application_collection"]
resource_collection = database["resources"]
placement_statistics_collection = database["placement_statistics"]
notification_collection = database["notification"]
activity_logs_collection = database["activity_logs"]
announcement_collection = database["announcement"]
# cloudibary credentials
cloudinary.config(
    cloud_name="dhysz4sun",
    api_key="537939189425699",
    api_secret="Zu7Ss3Vjr2Y3NjIuaB3Ttb0lgeU",
)


# RESEND Credentials
RESEND_API_KEY = "re_We5zoGci_2wfiaN3aP8LahZfXS7M1TFjK"
FROM_EMAIL = "onboarding@resend.dev"


# JWT

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "mysecretkey999"  # Use a strong secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 720  ## 12 hours


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    student_id = payload.get("sub")  # sub is student_id
    if not student_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = student_collection.find_one({"student_id": student_id})
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user


def get_current_admin(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    email = payload.get("sub")  # sub is email
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    admin = admin_collection.find_one({"email": email})
    if admin is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return admin
