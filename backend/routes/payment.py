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

    # 🔥 GERÇEK IP AL
    user_ip = request.headers.get("x-forwarded-for")
    if user_ip:
        user_ip = user_ip.split(",")[0]
    else:
        user_ip = request.client.host

    # 🔥 GERÇEK EMAIL (modelde varsa)
    user_email = getattr(current_user, "email", None)
    if not user_email:
        user_email = f"{current_user.username}@example.com"

    pay_data = paytr.create_payment_session(
        order=order,
        user_email=user_email,
        user_ip=user_ip
    )

    return pay_data


# -------------------------------
# CALLBACK
# -------------------------------
@router.post("/callback")
async def payment_callback(request: Request, db: Session = Depends(database.get_db)):
    form_data = await request.form()

    # 🔥 HASH VERIFY
    if not paytr.verify_callback(form_data):
        logging.warning("PAYTR: Invalid hash")
        return "OK"  # ❗ ALWAYS OK

    merchant_oid = form_data.get("merchant_oid")
    status = form_data.get("status")

    if not merchant_oid:
        return "OK"

    order = db.query(models.Order).filter(models.Order.id == int(merchant_oid)).first()

    if not order:
        return "OK"

    # 🔥 DUPLICATE CALLBACK PROTECTION
    if order.status in ["paid", "shipped"]:
        return "OK"

    if status == "success":
        order.status = "paid"
        db.commit()

        # 🔥 SHIPPING (SAFE)
        try:
            tracking_number = shipping_service.create_shipment(order)

            if tracking_number:
                order.tracking_number = tracking_number
                order.status = "shipped"
                db.commit()

        except Exception as e:
            logging.error(f"Shipping error: {str(e)}")

    else:
        order.status = "failed"
        db.commit()

    return "OK"
