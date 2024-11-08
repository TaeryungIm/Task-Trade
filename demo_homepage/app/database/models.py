from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, LargeBinary, Text
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum
from datetime import datetime
from app.database.database import Base

from app.exchange_system.exchange_schema import TransactionType

import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Now the ENCRYPTION_KEY will be available in the environment
encryption_key = os.getenv("ENCRYPTION_KEY")
if encryption_key is None:
    raise ValueError("ENCRYPTION_KEY is not set in the environment")

cipher = Fernet(encryption_key)


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

    _balance_encrypted = Column(LargeBinary, nullable=False)  # Encrypted balance field

    # connection with other tables
    demo_inquiry = relationship("InquiryTable", back_populates="demo_user", cascade="all, delete")
    demo_quest = relationship("QuestTable", back_populates="demo_user", cascade="all, delete")
    demo_transaction = relationship("TransactionLogTable", back_populates="demo_user", cascade="all, delete")

    # Encrypt the balance when setting
    @property
    def balance(self):
        return int(cipher.decrypt(self._balance_encrypted).decode())

    @balance.setter
    def balance(self, value):
        self._balance_encrypted = cipher.encrypt(str(value).encode())


class InquiryTable(Base):
    __tablename__ = "demo_inquiries"  # Inquiry Table name

    # inquiry info
    id = Column(Integer, primary_key=True, index=True)
    inquiry_title = Column(String(50), nullable=False)
    inquiry_content = Column(String(500), nullable=False)
    userid = Column(String(50), ForeignKey("demo_users.userid", ondelete="CASCADE"))

    # time info
    created_at = Column(DateTime, default=datetime.utcnow(), nullable=False)
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
    created_at = Column(DateTime, default=datetime.utcnow(), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow(), onupdate=datetime.utcnow())

    # connection with UserTable
    demo_user = relationship("UserTable", back_populates="demo_quest")


class TransactionLogTable(Base):
    __tablename__ = "demo_transaction_log"

    transaction_id = Column(Integer, primary_key=True, index=True)
    userid = Column(String(50), ForeignKey("demo_users.userid"), nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    _amount_encrypted = Column(LargeBinary, nullable=False)  # Encrypted amount field
    balance_after = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    notes = Column(Text, nullable=True)

    demo_user = relationship("UserTable", back_populates="demo_transaction")

    @property
    def amount(self):
        return int(cipher.decrypt(self._amount_encrypted).decode())

    @amount.setter
    def amount(self, value):
        self._amount_encrypted = cipher.encrypt(str(value).encode())
