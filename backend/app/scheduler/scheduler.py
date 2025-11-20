from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from app.config.db import company_collection


def closed_expired_companies():
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    print(f"Running scheduler: closing companies before {today.isoformat()}")

    # Update companies where apply_before is less than today and status isn't already Closed
    company_collection.update_many(
        {
            "apply_before": {"$lt": today},
            "status": {"$ne": "Closed"},
        },
        {"$set": {"status": "Closed"}},
    )
