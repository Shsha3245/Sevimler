from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import update

import database, auth, models
from payment import paytr

router = APIRouter(prefix="/payment", tags=["payment"])


# =========================
# REQUEST MODEL
# =========================
class PaymentCreateRequest(BaseModel):
    order_id: int


# =========================
# CREATE PAYMENT SESSION
# =========================
@router.post("/create")
def create_payment(
    payload: PaymentCreateRequest,
    request: Request,
    db: Session = Depends(database.get_db),
    user=Depends(auth.get_current_user)
):
    # =========================
    # ORDER FETCH
    # =========================
    order = db.query(models.Order).filter(
        models.Order.id == payload.order_id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # =========================
    # OWNERSHIP CHECK
    # =========================
    if order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # =========================
    # EMAIL CHECK (STRICT)
    # =========================
    user_email = getattr(user, "email", None)
    if not user_email:
        raise HTTPException(status_code=400, detail="User email missing")

    # =========================
    # IDEMPOTENCY CHECK (CRITICAL FIX)
    # =========================
    if order.status == "PAID":
        raise HTTPException(status_code=400, detail="Order already paid")

    if order.status == "PAYMENT_INITIATED":
        # aynı ödeme tekrar istenirse yeniden oluşturma
        return paytr.create_payment_session(
            order=order,
            user_email=user_email,
            user_ip=request.client.host
        )

    # =========================
    # IP SAFE EXTRACTION
    # =========================
    xff = request.headers.get("x-forwarded-for")
    user_ip = (
        xff.split(",")[0].strip()
        if xff
        else request.client.host
    )

    # =========================
    # ATOMIC STATUS UPDATE (SAFE)
    # =========================
    db.execute(
        update(models.Order)
        .where(models.Order.id == order.id)
        .values(status="PAYMENT_INITIATED")
    )
    db.commit()

    # refresh order state
    db.refresh(order)

    # =========================
    # PAYMENT SESSION
    # =========================
    try:
        response = paytr.create_payment_session(
            order=order,
            user_email=user_email,
            user_ip=user_ip
        )

        return response

    except Exception as e:
        # rollback state on failure
        db.execute(
            update(models.Order)
            .where(models.Order.id == order.id)
            .values(status="PENDING")
        )
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Payment init failed: {str(e)}"
        )
