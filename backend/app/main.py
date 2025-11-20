from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes.student_route import student_route
from app.routes.admin_route import admin_router
from app.routes.company_route import company_router
from app.routes.notification_route import notification_router
from app.routes.announcment_route import announcement_router
from fastapi.security import OAuth2PasswordRequestForm
from app.config.db import (
    student_collection,
    admin_collection,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from datetime import timedelta
from passlib.context import CryptContext
import time
from apscheduler.schedulers.background import BackgroundScheduler
from app.scheduler.scheduler import closed_expired_companies

app = FastAPI(title="Placement Management System", docs_url="/api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(student_route, tags=["Student"])
app.include_router(admin_router, tags=["Admin"])
app.include_router(company_router, tags=["Company"])
app.include_router(notification_router, tags=["Notification"])
app.include_router(announcement_router, tags=["Announcement"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

scheduler = BackgroundScheduler()
scheduler.add_job(closed_expired_companies, "cron", hour=0, minute=0)  # Run daily
scheduler.start()


@app.middleware("http")
async def log_request_time(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    print(
        f"\nTime Log of request ==== {request.method} {request.url} took {duration:.2f}s\n"
    )
    return response


@app.post("/token", response_model=dict)
def authentication_token(form_data: OAuth2PasswordRequestForm = Depends()):
    collections = [student_collection, admin_collection]
    user_data = None
    role = None  # track whether it's a student or admin

    for collection in collections:
        user_data = collection.find_one({"email": form_data.username})
        if user_data:
            if pwd_context.verify(form_data.password, user_data["password"]):
                role = "student" if collection == student_collection else "admin"
                break
            else:
                raise HTTPException(
                    status_code=401,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )

    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # store sub and role in token
    sub_value = user_data["student_id"] if role == "student" else user_data["email"]
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": sub_value, "role": role}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
