from fastapi import APIRouter, HTTPException
from fastapi import Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, scoped_session
from starlette.templating import Jinja2Templates

from app.database.database import get_db, SessionLocal
from app.account_system.account_schema import UserCreate
from app.account_system.account_add_db import get_existing_user, create_user

templates = Jinja2Templates(directory="app/templates")
session = scoped_session(SessionLocal)


create_account = APIRouter(
    prefix="/create_account",
)


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

