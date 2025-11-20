from pydantic import BaseModel


class AddAnnouncement(BaseModel):
    title: str
    content: str
