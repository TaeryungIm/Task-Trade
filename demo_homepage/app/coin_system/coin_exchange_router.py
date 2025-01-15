from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import scoped_session
from sqlalchemy.exc import IntegrityError
from starlette.responses import HTMLResponse, JSONResponse
from starlette.templating import Jinja2Templates

from app.database.database import SessionLocal, get_db

from app.account_system.account_db import get_user_by_id

from app.coin_system.coin_db import create_transaction, get_transaction_type
from app.coin_system.coin_schema import UpdateBalance, TransactionRecord

templates = Jinja2Templates(directory="app/templates")
session = scoped_session(SessionLocal)

exchange = APIRouter(
    prefix="/exchange",
)


# Used for updating the balance
@exchange.post("/update/balance")
async def upd_user_balance_exg(update_balance: UpdateBalance, db: session = Depends(get_db)):
    try:
        userid = update_balance.user_id
        existing_user = get_user_by_id(db, userid)
        if not existing_user:
            return JSONResponse(status_code=400, content={"success": False, "updated_balance": "no user!"})

        # decrease the balance as amount of withdrawal
        existing_user.balance += update_balance.update_balance

        create_transaction(db, TransactionRecord(
                               user_id=userid,
                               transaction_type=get_transaction_type(update_balance.update_balance),
                               updated_amount=abs(update_balance.update_balance),
                               balance_after=existing_user.balance
                           ))
        return JSONResponse(status_code=200, content={"success": True, "updated_balance": existing_user.balance})

    except IntegrityError as e:
        db.rollback()
        print(f"Error occurred: {str(e)}")
        return JSONResponse(status_code=500, content={"success": False, "updated_balance": "Internal server error"})
