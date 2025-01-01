from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import desc
from sqlalchemy.orm import scoped_session
from starlette.templating import Jinja2Templates

from app.database.database import SessionLocal, get_db

from app.database.models import TransactionLogTable

templates = Jinja2Templates(directory="app/templates")
session = scoped_session(SessionLocal)

history = APIRouter(
    prefix="/history"
)


@history.post("/record")
async def get_transaction_record(request: Request, db: session = Depends(get_db)):
    # Parse the request body
    request_data = await request.json()
    user_id = request_data.get("user_id")

    # Query the database for the user's transaction logs
    transactions = (
        db.query(TransactionLogTable)
        .filter(TransactionLogTable.userid == user_id)
        .order_by(desc(TransactionLogTable.created_at))  # Sort by most recent transactions
        .all()
    )

    # If no transactions are found, raise an HTTPException
    if not transactions:
        raise HTTPException(status_code=404, detail="No transaction records found for the specified user.")

    # Format the response to include decrypted amount and exclude encrypted data
    response = []
    for transaction in transactions:
        response.append({
            "transaction_id": transaction.transaction_id,
            "transaction_type": transaction.transaction_type.name,  # Convert Enum to string
            "amount": transaction.amount,  # Decrypted amount
            "created_at": transaction.created_at,
            "notes": transaction.notes
        })

    return {"userid": user_id, "transactions": response}
