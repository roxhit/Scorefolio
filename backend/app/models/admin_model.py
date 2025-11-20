from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List


class AdminLogin(BaseModel):
    admin_email: EmailStr = Field(..., description="Admin email")
    admin_password: str


class CreateAdmin(BaseModel):
    first_name: str = Field(..., description="First name of the admin")
    last_name: str = Field(..., description="Last name of the admin")
    email: EmailStr
    password: str
