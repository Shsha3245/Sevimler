from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import models, database, auth
from payment import paytr
from shipping import service as shipping_service
import logging

router = APIRouter(prefix="/payment", tags=["payment"])


# -------------------------------
# CREATE PAYMENT
# -------------------------------
@router.post("/create")
async def create_payment(
    request: Request,
    order_id_data: dict,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    order_id = order_id_data.get("order_id")

    if not order_id:
        raise HTTPException(status_code=400, detail="order_id is required")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # -------------------------------
    # REAL IP (PayTR UYUMLU)
    # -------------------------------
    user_ip = request.headers.get("x-forwarded-for")
    if user_ip:
        user_ip = user_ip.split(",")[0].strip()
    else:
        user_ip = request.client.host

    # -------------------------------
    # REAL EMAIL (ORDER'DAN AL)
    # -------------------------------
    user_email = getattr(order, "email", None)

    if not user_email:
        user_email = getattr(current_user, "email", None)

    if not user_email:
        user_email = f"{current_user.username}@example.com"

    # -------------------------------
    # PAYTR SESSION
    # -------------------------------
    pay_data = paytr.create_payment_session(
        order=order,
        user_email=user_email,
        user_ip=user_ip
    )

    return pay_data
