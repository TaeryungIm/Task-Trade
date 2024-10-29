from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class UserTable(Base):
    __tablename__ = "demo_users"  # User Table name

    # account info
    id = Column(Integer, primary_key=True, index=True)
    userid = Column(String(50), nullable=False)  # Specify length for VARCHAR
    username = Column(String(100), nullable=False)  # VARCHAR with length
    email = Column(String(100), unique=True, nullable=False)  # VARCHAR with length
    password = Column(String(100), nullable=False)  # VARCHAR with length
    gender = Column(String(10), nullable=False)
    age = Column(Integer, nullable=False)

    demo_inquiries = relationship("InquiryTable", back_populates="demo_user")


class InquiryTable(Base):
    __tablename__ = "demo_inquiries" # Inquiry Table name

    # inquiry info
    id = Column(Integer, primary_key=True, index=True)
    inquiry_title = Column(String(50), nullable=False)
    inquiry_content = Column(String(500), nullable=False)

    # time info
    created_at = Column(DateTime, default=datetime.utcnow())
    updated_at = Column(DateTime, default=datetime.utcnow(), onupdate=datetime.utcnow())
