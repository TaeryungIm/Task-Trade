from datetime import datetime
from sqlalchemy.orm import scoped_session
from sqlalchemy.exc import IntegrityError

from app.database.models import TransactionLogTable
from app.database.database import SessionLocal

from app.coin_system.coin_schema import TransactionRecord, TransactionType

session = scoped_session(SessionLocal)


def get_transaction_type(updated_balance: int):
    if updated_balance >= 0:
        return TransactionType.DEPOSIT
    else:
        return TransactionType.WITHDRAW


def create_transaction(db: session, transaction_record: TransactionRecord):
    db_transaction = TransactionLogTable(
        userid=transaction_record.user_id,
        transaction_type=transaction_record.transaction_type,
        balance_after=transaction_record.balance_after,
        created_at=datetime.utcnow(),  # Explicitly set the current time
    )
    db_transaction.amount = transaction_record.updated_amount  # Use the property setter to encrypt the amount

    db.add(db_transaction)
    try:
        db.commit()
        return f"New transaction log created at {datetime.utcnow()}..."  # updated to match the current timestamp
    except IntegrityError as e:
        db.rollback()
        return f"Error creating transaction log: {str(e)}"
