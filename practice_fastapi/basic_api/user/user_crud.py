from passlib.context import CryptContext
from sqlalchemy.orm import Session
from user.user_schema import UserCreate
from app.models import UserTable

# crypto password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_user(db: Session, user_create: UserCreate):
    db_user = UserTable(username=user_create.username,
                   password=pwd_context.hash(user_create.password1),
                   email=user_create.email)
    db.add(db_user)
    db.commit()


def get_existing_user(db: Session, user_create: UserCreate):
    return db.query(UserTable).filter(
        (UserTable.username == user_create.username) |
        (UserTable.email == user_create.email)
    ).first()

