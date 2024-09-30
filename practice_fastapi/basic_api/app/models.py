from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


class UserTable(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    gender = Column(String, unique=True, nullable=False)
    age = Column(Integer, primary_key=True)
    password = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)


class User(BaseModel):
    id      : str
    username: str
    gender  : str
    age     : int
    password: str
    email   : str

