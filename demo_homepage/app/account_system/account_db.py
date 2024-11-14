from passlib.context import CryptContext
from sqlalchemy.orm import scoped_session
from app.account_system.account_schema import UserCreate, UserUpdate
from app.database.models import UserTable
from app.database.database import SessionLocal

session = scoped_session(SessionLocal)

# crypto password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_user(db: session, user_create: UserCreate):
    db_user = UserTable(
        userid=user_create.user_id,
        username=user_create.user_name,
        password=pwd_context.hash(user_create.password),  # hash password
        gender=user_create.gender,
        age=user_create.age,
        contact_number=user_create.contact,
    )
    db_user.balance = user_create.balance
    db.add(db_user)
    try:
        db.commit()
        return f"New user {user_create.username} created..."
    except:
        db.rollback()
        return "Error creating user"


def update_user(db: session, user_update: UserUpdate):
    db_user = db.query(UserTable).filter(UserTable.userid == user_update.cur_id).first()
    if db_user is None:
        return "User not found"

    # 사용자 정보 변경
    db_user.userid = user_update.upd_id if user_update.upd_id else db_user.userid
    if user_update.upd_pw:
        db_user.password = pwd_context.hash(user_update.upd_pw)
    try:
        db.commit()
        return f"User {user_update.cur_id} updated successfully."
    except:
        db.rollback()
        return "Error updating user"


def get_user_by_id(db: session, userid: str):
    return db.query(UserTable).filter(UserTable.userid == userid).first()


def get_existing_user(db: session, user_create: UserCreate):
    return db.query(UserTable).filter(
        (UserTable.username == user_create.user_name) |
        (UserTable.userid == user_create.user_id)
    ).first()
