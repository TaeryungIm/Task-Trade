from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi import Depends, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, scoped_session
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from app.database.database import get_db, SessionLocal
from app.inquiry_system.inquiry_db import create_inquiry
from app.inquiry_system.inquiry_schema import InquiryCreate, InquiryEmail
from app.inquiry_system.inquiry_email import send_email

templates = Jinja2Templates(directory="app/templates")
session = scoped_session(SessionLocal)


inquiry = APIRouter(
    prefix="/inquiry",
)


# Handle POST request for creating an account
@inquiry.get("/", response_class=HTMLResponse)
async def make_inquiry(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("inquiry.html", context)


# Create new inquiry to the database
@inquiry.post("/create")
async def create_quest_db(inquiry_create: InquiryCreate, db: Session = Depends(get_db)):
    try:
        create_inquiry(db, inquiry_create)
        return {"message": "Inquiry created successfully!"}
    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Send user inquiry to official email
@inquiry.post("/send_email")
async def send_inquiry_email(email_data: InquiryEmail, bg_tasks: BackgroundTasks):
    try:
        # Add the email-sending task to the background
        # userid stands for from-email address
        bg_tasks.add_task(send_email,
                          email_data.user_id,
                          email_data.inquiry_title,
                          email_data.inquiry_content)
        return {"message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send email: " + str(e))
