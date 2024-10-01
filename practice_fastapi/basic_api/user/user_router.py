from fastapi import APIRouter, HTTPException
from fastapi import Depends, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, scoped_session
from starlette import status
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from app.database import get_db, SessionLocal
from app.models import UserTable
from user import user_crud, user_schema
from user.user_schema import UserCreate
from user.user_crud import get_existing_user, create_user, pwd_context

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

