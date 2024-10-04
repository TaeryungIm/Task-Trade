from sqlalchemy import Column, Integer, String
from .database import Base


class UserTable(Base):
    __tablename__ = "demo_users"  # Table name

    userid = Column(String(50), primary_key=True)  # Specify length for VARCHAR
    username = Column(String(100), nullable=False)  # VARCHAR with length
    email = Column(String(100), unique=True, nullable=False)  # VARCHAR with length
    password = Column(String(100), nullable=False)  # VARCHAR with length
    gender = Column(String(10), nullable=False)
    age = Column(Integer, nullable=False)

