from fastapi import APIRouter, HTTPException
from fastapi import Depends, Request
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from app.database.database import get_db
from app.quest_system.quest_schema import QuestCreate, QuestRequest, QuestResponse
from app.quest_system.quest_db import create_quest, get_quest_by_id

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
    except ValidationError as ve:
        raise HTTPException(status_code=422, detail=ve.errors())
    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Display all possible quests in progress
@quest.post("/display", response_model=QuestResponse)
async def get_quest_from_db(quest_request: QuestRequest, db: Session = Depends(get_db)):
    # get requested quest by id
    requested_quest = get_quest_by_id(db, quest_request.quest_index)

    if requested_quest is None:
        # Raise a 404 Not Found error if the quest does not exist
        raise HTTPException(status_code=404, detail="Quest not found")

    # If found, return the requested quest
    return QuestResponse(
        quest_title=requested_quest.quest_title,
        quest_type=requested_quest.quest_type,
        user_id=requested_quest.userid,
        updated_at=requested_quest.updated_at
    )
