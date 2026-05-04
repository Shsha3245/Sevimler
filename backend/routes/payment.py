from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import database, auth, models
from payment import paytr

router = APIRouter(prefix="/payment", tags=["payment"])


@router.post("/create")
def create_payment(
    payload: dict,
    request: Request,
    db: Session = Depends(database.get_db),
    user = Depends(auth.get_current_user)
):
    order_id = payload.get("order_id")

    if not order_id:
        raise HTTPException(400, "order_id missing")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        raise HTTPException(404, "order not found")

    if order.user_id != user.id:
        raise HTTPException(403, "forbidden")

    # FIX IP
    ip = request.headers.get("x-forwarded-for", request.client.host)

    # FIX EMAIL
    email = getattr(order, "email", None) or getattr(user, "email", None) or f"{user.username}@mail.com"

    return paytr.create_payment_session(
        order=order,
        user_email=email,
        user_ip=ip
    )
