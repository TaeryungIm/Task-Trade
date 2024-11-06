from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class UserTable(Base):
    __tablename__ = "demo_users"  # User Table name

    # account info + nickname?
    id = Column(Integer, primary_key=True, index=True)
    userid = Column(String(50), unique=True, nullable=False)  # Specified as e-mail
    username = Column(String(100), nullable=False)  # VARCHAR with length
    password = Column(String(100), nullable=False)  # VARCHAR with length
    gender = Column(String(10), nullable=False)
    age = Column(Integer, nullable=False)
    contact_number = Column(String(15), nullable=True)

    # connection with other tables
    demo_inquiry = relationship("InquiryTable", back_populates="demo_user", cascade="all, delete")
    demo_quest = relationship("QuestTable", back_populates="demo_user", cascade="all, delete")


class InquiryTable(Base):
    __tablename__ = "demo_inquiries"  # Inquiry Table name

    # inquiry info
    id = Column(Integer, primary_key=True, index=True)
    inquiry_title = Column(String(50), nullable=False)
    inquiry_content = Column(String(500), nullable=False)
    userid = Column(String(50), ForeignKey("demo_users.userid", ondelete="CASCADE"))

    # time info
    created_at = Column(DateTime, default=datetime.utcnow())
    updated_at = Column(DateTime, default=datetime.utcnow(), onupdate=datetime.utcnow())

    # connection with UserTable
    demo_user = relationship("UserTable", back_populates="demo_inquiry")


class QuestTable(Base):
    __tablename__ = "demo_quests"  # Quest Table name

    # quest info
    id = Column(Integer, primary_key=True, index=True)
    quest_title = Column(String(50), nullable=False)
    quest_type = Column(String(50), nullable=False)
    quest_content = Column(String(500), nullable=False)
    userid = Column(String(50), ForeignKey("demo_users.userid", ondelete="CASCADE"))

    # time info
    created_at = Column(DateTime, default=datetime.utcnow())
    updated_at = Column(DateTime, default=datetime.utcnow(), onupdate=datetime.utcnow())

    # connection with UserTable
    demo_user = relationship("UserTable", back_populates="demo_quest")
