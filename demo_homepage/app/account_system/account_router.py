from fastapi import APIRouter, HTTPException
from fastapi import Depends, Form
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, scoped_session
from starlette.templating import Jinja2Templates
from starlette.responses import JSONResponse

from app.database.database import get_db, SessionLocal
from app.account_system.account_schema import UserCreate
from app.account_system.account_add_db import get_existing_user, create_user, get_user_by_id

templates = Jinja2Templates(directory="app/templates")
session = scoped_session(SessionLocal)


account = APIRouter(
    prefix="/account",
)


@account.post("/create/create")
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


@account.post("/modify/idcheck")
async def id_check_exist(userid: str = Form(...), db: Session = Depends(get_db)):
    try:
        existing_user = get_user_by_id(db, userid)
        if not existing_user:
            return JSONResponse(status_code=400, content={"success": False, "message": "존재하지 않는 아이디입니다"})

        return {"success": True, "message": "아이디가 존재합니다"}

    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})
