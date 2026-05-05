from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
import database, models
from payment import paytr

router = APIRouter(prefix="/payment", tags=["payment"])

class PaymentCreateRequest(BaseModel):
    order_id: int

@router.post("/create")
def create_payment(
    payload: PaymentCreateRequest,
    request: Request,
    db: Session = Depends(database.get_db)
):
    """
    Ödeme oturumunu başlatır. 
    Artık Depends(auth.get_current_user) kullanmıyoruz, 
    böylece misafir kullanıcılar da ödeme yapabilir.
    """
    
    # 1. Siparişi çek (İlişkili ürünleri ve sipariş kalemlerini dahil ederek)
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items)
            .joinedload(models.OrderItem.product)
        )
        .filter(models.Order.id == payload.order_id)
        .first()
    )

    # 2. Güvenlik ve Durum Kontrolleri
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")

    if order.status == "PAID":
        raise HTTPException(status_code=400, detail="Bu sipariş zaten ödenmiş.")

    # 3. E-posta Belirleme
    # Misafir alışverişinde e-posta sipariş tablosunda kayıtlı olmalıdır.
    # Eğer modelinizde 'email' alanı yoksa, telefon bilgisini kullanıyoruz.
    user_email = getattr(order, 'email', None)
    if not user_email:
        # Eğer e-posta yoksa telefon numarasını e-posta formatına sokup PayTR'ye gönderiyoruz
        user_email = f"{order.phone}@guest.com"

    # 4. Sipariş Durumunu Güncelle
    order.status = "PAYMENT_INITIATED"
    db.commit()
    db.refresh(order)

    try:
        # 5. PayTR Session Verilerini Hazırla (paytr.py'yi çağırır)
        payment_data = paytr.create_payment_session(
            order=order,
            user_email=user_email,
            request=request
        )
        
        return payment_data

    except Exception as e:
        # Hata durumunda durumu tekrar PENDING'e çek ki kullanıcı tekrar ödemeyi deneyebilsin
        order.status = "PENDING"
        db.commit()
        print(f"PAYMENT ROUTE ERROR: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Ödeme oturumu oluşturulamadı: {str(e)}"
        )
