from fastapi import APIRouter, HTTPException
from fastapi import Depends, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, scoped_session
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from Database.database import get_db, SessionLocal
from Account_system.user_schema import UserCreate
from Account_system.user_add_db import get_existing_user, create_user

templates = Jinja2Templates(directory="templates")
session = scoped_session(SessionLocal)


ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
SECRET_KEY = "45f3f4372e4acbebe7a9ee69079b3093dfedd7bea9b86ac618346fdea8f0341e"
ALGORITHM = "HS256"


create_account = APIRouter(
    prefix="/create_account",
)


# Handle POST request for creating an account
@create_account.get("/", response_class=HTMLResponse)
async def create_account_open(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("create_account.html", context)


@create_account.post("/")
async def create_account_db(user_create: UserCreate, db: Session = Depends(get_db)):
    try:
        existing_user = get_existing_user(db, user_create)
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        create_user(db, user_create)
        return {"message": "User created successfully!"}
    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

