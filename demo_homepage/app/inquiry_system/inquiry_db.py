from datetime import datetime
from sqlalchemy.orm import scoped_session

from app.inquiry_system.inquiry_schema import InquiryCreate

from app.database.models import InquiryTable
from app.database.database import SessionLocal

session = scoped_session(SessionLocal)


def create_inquiry(db: session, inquiry_create: InquiryCreate):
    db_inquiry = InquiryTable(
        inquiry_title=inquiry_create.inquiry_title,
        inquiry_content=inquiry_create.inquiry_content,
        userid=inquiry_create.user_id,  # use userid as a key
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_inquiry)
    try:
        db.commit()
        return f"New inquiry title of {inquiry_create.quest_title} created..."
    except:
        db.rollback()
        return "Error creating inquiry!"
