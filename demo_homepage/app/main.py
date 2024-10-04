from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

from app.account_system.login_router import login
from app.database.database import Base, engine
from app.account_system import account_router, login_router
from app.quest_system import quest_router
from app.inquiry_system import inquiry_router
from app.exchange_system import exchange_router

app = FastAPI()
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://127.0.0.1:8000/main",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(account_router.create_account)
app.include_router(quest_router.quest)
app.include_router(inquiry_router.inquiry)
app.include_router(exchange_router.exchange)
app.include_router(login_router.login)


@app.on_event("startup")
def on_startup():
    # Create all tables
    Base.metadata.create_all(bind=engine)


@app.get("/", response_class=HTMLResponse)
async def root_home(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("main.html", context)

