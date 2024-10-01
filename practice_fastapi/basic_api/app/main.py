from fastapi import FastAPI, Request, Form
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse
from starlette.templating import Jinja2Templates

from app.database import Base, engine
from user import user_router

app = FastAPI()
templates = Jinja2Templates(directory="templates")

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

# app.include_router(user_router.router)
app.include_router(user_router.login)
app.include_router(user_router.create_account)


@app.on_event("startup")
def on_startup():
    # Create all tables
    Base.metadata.create_all(bind=engine)


@app.get("/", response_class=HTMLResponse)
async def root_home(request: Request):
    context = {'request': request}
    return templates.TemplateResponse("basic_main.html", context)

