from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.account_system.account_schema import UserCreate, UserUpdate
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


def update_user(db: Session, user_update: UserUpdate):
    db_user = db.query(UserTable).filter(UserTable.userid == user_update.curid).first()
    if db_user is None:
        return "User not found"

    # 사용자 정보 변경
    db_user.email = user_update.modemail if user_update.modemail else db_user.email
    db_user.userid = user_update.modid if user_update.modid else db_user.userid
    if user_update.modpw1:
        db_user.password = pwd_context.hash(user_update.modpw1)
    try:
        db.commit()
        return f"User {user_update.curid} updated successfully."
    except:
        db.rollback()
        return "Error updating user"


def get_user_by_id(db: Session, userid: str):
    return db.query(UserTable).filter(UserTable.userid == userid).first()


def get_existing_user(db: Session, user_create: UserCreate):
    return db.query(UserTable).filter(
        (UserTable.username == user_create.username) |
        (UserTable.userid == user_create.userid)
    ).first()


