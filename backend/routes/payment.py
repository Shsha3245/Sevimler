from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import update

import database, auth, models
from payment import paytr

router = APIRouter(prefix="/payment", tags=["payment"])

class PaymentCreateRequest(BaseModel):
    order_id: int

@router.post("/create")
def create_payment(
    payload: PaymentCreateRequest,
    request: Request,
    db: Session = Depends(database.get_db),
    user=Depends(auth.get_current_user)
):
    # Siparişi, kalemlerini ve o kalemlere ait ürün isimlerini tek seferde çekiyoruz
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items)
            .joinedload(models.OrderItem.product)
        )
        .filter(models.Order.id == payload.order_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")

    if order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok.")

    user_email = user.email
    if not user_email:
        raise HTTPException(status_code=400, detail="Kullanıcı e-posta adresi eksik.")

    if order.status == "PAID":
        raise HTTPException(status_code=400, detail="Bu sipariş zaten ödendi.")

    # Durumu güncelle ve kaydet
    order.status = "PAYMENT_INITIATED"
    db.commit()
    db.refresh(order)

    try:
        # paytr.py içindeki fonksiyonu 'request' nesnesiyle çağırıyoruz
        payment_data = paytr.create_payment_session(
            order=order,
            user_email=user_email,
            request=request
        )
        return payment_data

    except Exception as e:
        # Hata durumunda durumu PENDING'e çek ki kullanıcı tekrar deneyebilsin
        order.status = "PENDING"
        db.commit()
        print(f"ÖDEME HATASI: {str(e)}") # Terminalde hatayı görmek için
        raise HTTPException(
            status_code=500,
            detail=f"Ödeme başlatılamadı: {str(e)}"
        )
