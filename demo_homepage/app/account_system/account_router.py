from smtplib import SMTPException

from fastapi import APIRouter, HTTPException, Depends, Form, Request
from pydantic import EmailStr
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import scoped_session
from starlette.templating import Jinja2Templates
from starlette.responses import JSONResponse, HTMLResponse

from app.database.database import get_db, SessionLocal

from app.account_system.account_schema import UserCreate, UserUpdate, UserIDRequest
from app.account_system.account_db import get_existing_user, get_user_by_id, pwd_context
from app.account_system.account_db import create_user, update_user
from app.account_system.account_email import send_verification_email_userid

session = scoped_session(SessionLocal)
templates = Jinja2Templates(directory="app/templates")

account = APIRouter(
    prefix="/account",
)

update = APIRouter(
    prefix="/account/update",
)

verify = APIRouter(
    prefix="/account/verify"
)


@account.get("/create", response_class=HTMLResponse)
async def open_account_cre(request: Request):
    return templates.TemplateResponse("create_account.html", {'request': request})


@account.get("/profile", response_class=HTMLResponse)
async def open_profile(request: Request):
    return templates.TemplateResponse("my_account.html", {'request': request})


@account.post("/create/create")
async def create_account_db(user_create: UserCreate, db: session = Depends(get_db)):
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


@account.get("/balance")
async def get_current_balance(userid: str, db: session = Depends(get_db)):
    try:
        existing_user = get_user_by_id(db, userid)
        if not existing_user:
            return JSONResponse(status_code=400, content={"success": False, "balance": "존재하지 않는 아이디입니다!"})

        return JSONResponse(status_code=200, content={"success": True, "balance": existing_user.balance})

    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        return JSONResponse(status_code=500, content={"success": False, "balance": "error!"})


@account.post("/pwcheck")
async def pw_check_exist(userid: str = Form(...), userpw: str = Form(...), db: session = Depends(get_db)):
    try:
        existing_user = get_user_by_id(db, userid)
        if not existing_user or not pwd_context.verify(userpw, existing_user.password):
            return JSONResponse(status_code=400, content={"success": False, "message": "비밀번호가 다릅니다"})

        return JSONResponse(status_code=200, content={"success": True, "message": "비밀번호가 일치합니다"})

    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


@update.get("/password", response_class=HTMLResponse)
async def open_password_upd(request: Request):
    return templates.TemplateResponse("upd_user_pw.html", {'request': request})


@update.get("/name", response_class=HTMLResponse)
async def open_username_upd(request: Request):
    return templates.TemplateResponse("upd_user_name.html", {'request': request})


@update.get("/id", response_class=HTMLResponse)
async def open_userid_upd(request: Request):
    return templates.TemplateResponse("upd_user_id.html", {'request': request})


@update.post("/userdata")
async def upd_user_data(userdata: UserUpdate, db: session = Depends(get_db)):
    try:
        existing_user = get_user_by_id(db, userdata.cur_id)
        if not existing_user:
            raise HTTPException(status_code=400, detail="User not exists")

        message = update_user(db, userdata)
        return JSONResponse(status_code=200, content={"success": True, "message": message})

    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@verify.post("/userid")
async def open_verify_id(request: UserIDRequest):
    try:
        # Call the email sending function
        verify_code = send_verification_email_userid(request.user_id)

        return {"verification_code": verify_code, "message": "Verification email sent successfully."}
    except SMTPException as e:
        print(f"SMTP Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send verification email.")
    except Exception as e:
        print(f"Unexpected Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")