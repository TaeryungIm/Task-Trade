from fastapi import APIRouter, HTTPException
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, scoped_session

from starlette import status
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from datetime import timedelta, datetime
from authlib.jose import jwt
from dotenv import load_dotenv
import os

from app.database.database import get_db, SessionLocal
from app.login_system.login_schema import Token
from app.login_system.login_db import get_current_user
from app.account_system.account_db import pwd_context, get_user_by_id

templates = Jinja2Templates(directory="app/templates")
session = scoped_session(SessionLocal)
load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


login = APIRouter(
    prefix="/login",
)


# Handle POST request for creating an account
@login.get("/", response_class=HTMLResponse)
async def open_login(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("login.html", context)


@login.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),
                           db: session = Depends(get_db)):

    # check user and password
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY is not set or empty")
    user = get_user_by_id(db, form_data.username)  # username is userid
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # make access token
    data = {
        "sub": user.userid,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    header = {"alg": ALGORITHM}
    access_token = jwt.encode(header, data, SECRET_KEY).decode('utf-8')

    return Token(
        access_token=access_token,
        token_type="bearer"
    )


# Sample endpoint using get_current_user as a dependency
@login.get("/protected-endpoint")
async def protected_route(userid: str = Depends(get_current_user), db: session = Depends(get_db)):
    user = get_user_by_id(db, userid)
    return {"user_id": userid, "user_name": user.username,
            "user_contact": user.contact_number, "message": "This is a protected route."}
