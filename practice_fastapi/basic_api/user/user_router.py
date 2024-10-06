from datetime import timedelta, datetime
from jwt import encode

from fastapi import APIRouter, HTTPException
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, scoped_session
from starlette import status
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from app.database import get_db, SessionLocal
from user import user_crud, user_schema
from user.user_schema import UserCreate
from user.user_crud import get_existing_user, create_user, pwd_context

templates = Jinja2Templates(directory="templates")
session = scoped_session(SessionLocal)


ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
SECRET_KEY = "45f3f4372e4acbebe7a9ee69079b3093dfedd7bea9b86ac618346fdea8f0341e"
ALGORITHM = "HS256"


login = APIRouter(
    prefix="/login",
)


# Handle POST request for login
@login.get("/", response_class=HTMLResponse)
async def login_open(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("login.html", context)


@login.post("/", response_model=user_schema.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),
                           db: Session = Depends(get_db)):

    # check user and password
    user = user_crud.get_existing_user(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # make access token
    data = {
        "sub": user.username,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    access_token = encode(data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }


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

