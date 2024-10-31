from fastapi import APIRouter, HTTPException
from fastapi import Depends, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from app.database.database import get_db
from app.quest_system.quest_schema import QuestCreate
from app.quest_system.quest_db import create_quest

templates = Jinja2Templates(directory="app/templates")

quest = APIRouter(
    prefix="/quest",
)


# Handle POST request for creating an account
@quest.get("/", response_class=HTMLResponse)
async def quest_upload(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("quest_window.html", context)


# Create new quest to the database
@quest.post("/create")
async def create_quest_db(quest_create: QuestCreate, db: Session = Depends(get_db)):
    try:
        create_quest(db, quest_create)
        return {"message": "Quest created successfully!"}
    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


