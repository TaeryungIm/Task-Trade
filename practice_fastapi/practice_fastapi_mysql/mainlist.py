from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from starlette.middleware.cors import CORSMiddleware

from db import session
from model import UserTable, User, Base, ENGINE

templates = Jinja2Templates(directory="templates")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    print("Creating tables if they do not exist...")
    Base.metadata.create_all(bind=ENGINE)


@app.get("/")
async def root():
    return {"message": "/users 에서 사용자관리"}



@app.get('/users', response_class=HTMLResponse)
def read_users(request: Request):
    context = {}
    users = session.query(UserTable).all()

    context["request"] = request
    context["users"] = users

    return templates.TemplateResponse("user_list.html", context)


@app.get('/users/{user_id}', response_class=HTMLResponse)
def read_user(request: Request, user_id: int):
    context = {}
    user = session.query(UserTable).filter(UserTable.id == user_id).first()

    context["name"] = user.name
    context["age"] = user.age
    context["request"] = request

    return templates.TemplateResponse("user_detail.html", context)


@app.post('/users')
async def create_users(users: User):
    userList = list(users)
    uname = userList[1][1]
    uage = userList[2][1]

    user = UserTable()
    user.name = uname
    user.age = uage

    session.add(user)
    session.commit()

    return {"name": uname, "age": uage}


@app.put('/users')
async def update_users(users: User):
    userList = list(users)
    uid = userList[0][1]
    uname = userList[1][1]
    uage = userList[2][1]

    user = session.query(UserTable).filter(UserTable.id == uid).first()
    user.name = uname
    user.age = uage
    session.commit()

    return {"id": uid, "name": uname, "age": uage}



@app.delete('/users')
def delete_users(users: User):
    userList = list(users)
    uid = userList[0][1]
    uname = userList[1][1]

    user = session.query(UserTable).filter(UserTable.id == uid).first()
    if user is None:
        return {"result_msg", f"{uname} does not exist..."}

    session.delete(user)
    session.commit()

    return {"id": uid}

