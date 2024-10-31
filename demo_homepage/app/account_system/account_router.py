from fastapi import APIRouter, HTTPException
from fastapi import Depends, Form
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.templating import Jinja2Templates
from starlette.responses import JSONResponse

from app.database.database import get_db
from app.account_system.account_schema import UserCreate, UserUpdate
from app.account_system.account_add_db import get_existing_user, get_user_by_id, pwd_context
from app.account_system.account_add_db import create_user, update_user

templates = Jinja2Templates(directory="app/templates")

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


@account.post("/update/idcheck")
async def id_check_exist(userid: str = Form(...), db: Session = Depends(get_db)):
    try:
        existing_user = get_user_by_id(db, userid)
        if existing_user:
            return JSONResponse(status_code=400, content={"success": False, "message": "사용할 수 없는 아이디입니다!"})

        return JSONResponse(status_code=200, content={"success": True, "message": "사용 가능한 아이디입니다!"})

    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


@account.post("/update/pwcheck")
async def pw_check_exist(userid: str = Form(...), userpw: str = Form(...), db: Session = Depends(get_db)):
    try:
        existing_user = get_user_by_id(db, userid)
        if not existing_user or not pwd_context.verify(userpw, existing_user.password):
            return JSONResponse(status_code=400, content={"success": False, "message": "비밀번호가 다릅니다"})

        return JSONResponse(status_code=200, content={"success": True, "message": "비밀번호가 일치합니다"})

    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


@account.post("/update/userdata")
async def upd_user_data(userdata: UserUpdate, db: Session = Depends(get_db)):
    try:
        existing_user = get_user_by_id(db, userdata.curid)
        if not existing_user:
            raise HTTPException(status_code=400, detail="User not exists")

        update_user(db, userdata)
        return JSONResponse(status_code=200, content={"success": True, "message": "성공적으로 정보가 변경되었습니다!"})

    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
