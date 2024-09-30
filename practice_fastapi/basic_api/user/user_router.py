from fastapi import APIRouter, HTTPException
from fastapi import Depends, Request
from sqlalchemy.orm import Session, scoped_session
from starlette import status
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from app.database import get_db, SessionLocal
from app.models import User, UserTable
from user import user_crud, user_schema

templates = Jinja2Templates(directory="templates")
session = scoped_session(SessionLocal)

# router = APIRouter(
#     prefix="/router",
# )
#
#
# @router.post("/", status_code=status.HTTP_204_NO_CONTENT)
# def user_create(_user_create: user_schema.UserCreate, db: Session = Depends(get_db)):
#     user = user_crud.get_existing_user(db, user_create=_user_create)
#     if user:
#         raise HTTPException(status_code=status.HTTP_409_CONFLICT,
#                             detail="이미 존재하는 사용자입니다.")
#     user_crud.create_user(db=db, user_create=_user_create)


login = APIRouter(
    prefix="/login",
)


# Handle POST request for login
@login.get("/", response_class=HTMLResponse)
async def login_open(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("login.html", context)


@login.get("/back", response_class=HTMLResponse)
async def back_to_main(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("basic_main.html", context)


create_account = APIRouter(
    prefix="/create_account",
)


# Handle POST request for creating an account
@create_account.get("/", response_class=HTMLResponse)
async def create_account_open(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("create_account.html", context)


@create_account.get("/back", response_class=HTMLResponse)
async def back_to_main(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("basic_main.html", context)


@create_account.post("/", response_class=HTMLResponse)
async def create_account_data(user_account: User):
    userList = list(user_account)
    uid = userList[0][1]
    uname = userList[1][1]
    ugender = userList[2][1]
    uage = userList[3][1]
    upw = userList[4][1]
    uemail = userList[5][1]

    user_data = UserTable()
    user_data.id = uid
    user_data.username = uname
    user_data.gender = ugender
    user_data.age = uage
    user_data.password = upw
    user_data.email = uemail

    session.add(user_data)
    try:
        session.commit()
    except:
        session.rollback()

    return f"new user {uname} created..."
