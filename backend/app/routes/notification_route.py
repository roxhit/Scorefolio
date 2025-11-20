from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Optional
from app.config.db import (
    notification_collection,
    get_current_admin,
    student_collection,
    get_current_user,
)
from datetime import datetime

notification_router = APIRouter()


@notification_router.post("/send-notification")
async def send_notification(
    message: str = Body(..., embed=True),
    student_id: Optional[str] = Body(None, embed=True),
):
    """
    Send a notification to all students or a specific student.

    :param message: The notification message.
    :param student_id: (Optional) ID of a specific student. If "all", the notification is sent to all students.
    """
    if not message:
        raise HTTPException(status_code=400, detail="Message is required.")

    if student_id == "all":
        # Fetch all student IDs
        students = student_collection.find({}, {"student_id": 1, "_id": 0})
        student_ids = [student["student_id"] for student in students]

        if not student_ids:
            raise HTTPException(status_code=404, detail="No students found.")

        # Insert a notification for each student
        notifications = [
            {
                "message": message,
                "timestamp": datetime.utcnow(),
                "student_id": student_id,
            }
            for student_id in student_ids
        ]
        notification_collection.insert_many(notifications)

        return {"message": "Notification sent to all students."}

    else:
        # Insert notification for a specific student
        notification = {
            "message": message,
            "timestamp": datetime.utcnow(),
            "student_id": student_id,
        }
        notification_collection.insert_one(notification)
        return {"message": f"Notification sent to student with ID {student_id}."}


@notification_router.get("/notifications")
async def get_notifications(
    current_user: dict = Depends(get_current_user),
):
    """
    Get notifications for a specific student.

    :param student_id: ID of the student.
    """
    student_id = current_user["student_id"]
    if not student_id:
        raise HTTPException(status_code=400, detail="Student ID is required.")
    notifications = notification_collection.find(
        {"$or": [{"student_id": student_id}, {"student_id": "all"}]}
    )

    notifications_list = [
        {"message": notification["message"], "timestamp": notification["timestamp"]}
        for notification in notifications
    ]

    if not notifications_list:
        return {"message": "No notifications found."}

    return {"notifications": notifications_list}
