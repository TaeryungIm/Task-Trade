from django.utils.datetime_safe import datetime
from sqlalchemy.orm import Session
from app.inquiry_system.inquiry_schema import InquiryCreate
from app.database.models import InquiryTable


def create_inquiry(db: Session, inquiry_create: InquiryCreate):
    db_inquiry = InquiryTable(
        inquiry_title=inquiry_create.inquirytitle,
        inquiry_content=inquiry_create.inquirycontent,
        userid=inquiry_create.userid,  # use userid as a key
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_inquiry)
    try:
        db.commit()
        return f"New inquiry title of {inquiry_create.questtitle} created..."
    except:
        db.rollback()
        return "Error creating inquiry!"
