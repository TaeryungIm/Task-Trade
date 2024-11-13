from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from authlib.jose import jwt, JoseError
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

SECRET_KEY = os.getenv("SECRET_KEY")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the token using the SECRET_KEY
        payload = jwt.decode(token, SECRET_KEY, claims_options={"exp": {"essential": True}})
        userid: str = payload.get("sub")
        if userid is None:
            raise credentials_exception
    except JoseError:
        raise credentials_exception
    return userid
