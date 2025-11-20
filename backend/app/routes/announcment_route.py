from fastapi import APIRouter, Depends, HTTPException, status
from app.config.db import announcement_collection, get_current_admin
from app.models.announcements_model import AddAnnouncement
from datetime import datetime
from bson import ObjectId
from bson.json_util import dumps
from fastapi.responses import JSONResponse

announcement_router = APIRouter(prefix="/announcement", tags=["Announcement"])


@announcement_router.post("/add-announcement", status_code=status.HTTP_201_CREATED)
def add_announcement(
    announcement: AddAnnouncement, current_admin=Depends(get_current_admin)
):
    """
    Add a new announcement.
    """
    announcement_data = announcement.dict()
    announcement_data["admin_id"] = current_admin["_id"]
    announcement_data["created_at"] = datetime.now()

    # Insert the announcement into the database
    result = announcement_collection.insert_one(announcement_data)

    if result.acknowledged:
        return {
            "message": "Announcement added successfully",
            "announcement_id": str(result.inserted_id),
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to add announcement")


def serialize_announcement(doc):
    return {
        "_id": str(doc["_id"]),
        "title": doc.get("title"),
        "content": doc.get("content"),
        "admin_id": str(doc.get("admin_id")) if doc.get("admin_id") else None,
        "created_at": (
            doc.get("created_at").isoformat()
            if isinstance(doc.get("created_at"), datetime)
            else None
        ),
    }


@announcement_router.get("/get-announcements", status_code=status.HTTP_200_OK)
def get_announcements():
    """
    Get all announcements.
    """
    announcements = list(announcement_collection.find())
    serialized = [serialize_announcement(a) for a in announcements]
    return {"announcements": serialized}
