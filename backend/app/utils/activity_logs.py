from datetime import datetime
from app.config.db import activity_logs_collection


def log_activity(student_id: str, action: str, route: str, metadata: dict = None):
    activity_logs_collection.insert_one(
        {
            "student_id": student_id,
            "action": action,
            "route": route,
            "timestamp": datetime.utcnow(),
            "metadata": metadata or {},
        }
    )
