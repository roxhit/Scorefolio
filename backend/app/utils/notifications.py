from datetime import datetime, UTC
from fastapi import HTTPException
import threading
from app.config.db import notification_collection


def create_notification(
    user_id: str,
    trigger_event: str,
    notification_message: str,
    email_needed: bool,
    user_email: str = None,
    route: str = None,
    img_url: str = None,
):
    try:
        if not user_id or not trigger_event or not notification_message:
            raise ValueError("Missing required parameters for notification creation")

        created_on = datetime.datetime.now(UTC)

        notification_data = {
            "user_id": user_id,
            "trigger_event": trigger_event,
            "notification_message": notification_message,
            "created_on": created_on,
            "notification_priority": "Low",
            "is_read": False,
            "is_deleted": False,
            "route": route,
            "img_url": img_url,
        }

        # Insert notification into the database
        try:
            notification_collection.insert_one(notification_data)
        except Exception as db_error:
            print("Database Insert Error:", str(db_error))
            raise HTTPException(
                status_code=500, detail=f"Error inserting notification: {str(db_error)}"
            )

        # Send email if email_needed is True
        if email_needed:
            if not user_email:
                raise ValueError("Email address is required for email notifications")

            # credentials_data.update(
            #     {
            #         "destination_email": user_email,
            #         "subject": "Retired But Ready",
            #         "body": notification_message,
            #     }
            # )
            # # Send email in a separate thread
            # threading.Thread(
            #     target=send_email, args=(credentials_data, mail_url)
            # ).start()

    except Exception as e:
        print("Exception in create_notification:", str(e))
        raise HTTPException(
            status_code=500, detail=f"Error creating notification: {str(e)}"
        )
