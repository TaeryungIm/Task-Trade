from pydantic import BaseModel, EmailStr
from enum import Enum


# Account balance updating
class UpdateBalance(BaseModel):
    user_id: EmailStr
    update_balance: int


# Create transaction record
class TransactionRecord(BaseModel):
    user_id: EmailStr
    transaction_type: str
    updated_amount: int
    balance_after: int


class TransactionType(Enum):
    DEPOSIT = 1
    WITHDRAW = 2
