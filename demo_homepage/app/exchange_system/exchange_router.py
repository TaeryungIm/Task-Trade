from fastapi import APIRouter, Request
from sqlalchemy.orm import scoped_session
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from app.database.database import SessionLocal

templates = Jinja2Templates(directory="app/templates")
session = scoped_session(SessionLocal)

exchange = APIRouter(
    prefix="/exchange",
)


# Handle POST request for creating an account
@exchange.get("/", response_class=HTMLResponse)
async def exchange_coin(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("exchange.html", context)