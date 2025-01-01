from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import scoped_session
from starlette.responses import HTMLResponse, JSONResponse
from starlette.templating import Jinja2Templates

from app.database.database import SessionLocal, get_db


templates = Jinja2Templates(directory="app/templates")
session = scoped_session(SessionLocal)

coin = APIRouter(
    prefix="/coin",
)


# Handle POST request for creating an account
@coin.get("/", response_class=HTMLResponse)
async def main_coin(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("coin_main.html", context)
