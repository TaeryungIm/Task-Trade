from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

from app.database.database import Base, engine
from app.account_system import account_router
from app.login_system import login_router
from app.quest_system import quest_router
from app.inquiry_system import inquiry_router
from app.coin_system import coin_router, coin_charge_router, coin_exchange_router, coin_history_router

app = FastAPI()
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(account_router.account)
app.include_router(account_router.update)
app.include_router(account_router.verify)
app.include_router(quest_router.quest)
app.include_router(inquiry_router.inquiry)
app.include_router(coin_router.coin)
app.include_router(coin_charge_router.charge)
app.include_router(coin_exchange_router.exchange)
app.include_router(coin_history_router.history)
app.include_router(login_router.login)


@app.on_event("startup")
def on_startup():
    # Create all tables
    # Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


@app.get("/", response_class=HTMLResponse)
async def root_home(request: Request):
    return templates.TemplateResponse("main.html", {'request': request})
