from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.account_system.account_schema import UserCreate
from app.database.models import UserTable

# crypto password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_user(db: Session, user_create: UserCreate):
    db_user = UserTable(
        userid=user_create.userid,
        username=user_create.username,
        password=pwd_context.hash(user_create.password1),  # hash password
        email=user_create.email,
        gender=user_create.gender,
        age=user_create.age
    )
    db.add(db_user)
    try:
        db.commit()
        return f"New user {user_create.username} created..."
    except:
        db.rollback()
        return "Error creating user"


def get_user_by_id(db: Session, userid: str):
    return db.query(UserTable).filter(UserTable.userid == userid).first()


def get_existing_user(db: Session, user_create: UserCreate):
    return db.query(UserTable).filter(
        (UserTable.username == user_create.username) |
        (UserTable.email == user_create.email)
    ).first()


