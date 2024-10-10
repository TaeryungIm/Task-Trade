from fastapi import APIRouter, HTTPException
from fastapi import Depends, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, scoped_session
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from app.database.database import get_db, SessionLocal
from app.account_system.account_schema import UserCreate
from app.account_system.account_add_db import get_existing_user, create_user

templates = Jinja2Templates(directory="app/templates")
session = scoped_session(SessionLocal)


quest = APIRouter(
    prefix="/quest",
)


# Handle POST request for creating an account
@quest.get("/", response_class=HTMLResponse)
async def quest_upload(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("quest_window.html", context)