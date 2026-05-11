from fastapi import APIRouter, Depends, HTTPException, Request, Form
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
import database, models
from payment import paytr

router = APIRouter(prefix="/payment", tags=["payment"])

class PaymentCreateRequest(BaseModel):
    order_id: int

@router.post("/create")
@router.post("/create/")
def create_payment(
    payload: PaymentCreateRequest,
    request: Request,
    db: Session = Depends(database.get_db)
):
    """
    Ödeme oturumunu başlatır. 
    Misafir kullanıcılar da sipariş ID üzerinden ödeme başlatabilir.
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
    user_email = getattr(order, 'email', None)
    if not user_email:
        user_email = f"{order.phone}@guest.com"

    # 4. Sipariş Durumunu Güncelle
    order.status = "PAYMENT_INITIATED"
    db.commit()
    db.refresh(order)

    try:
        # 5. PayTR Session Verilerini Hazırla
        payment_data = paytr.create_payment_session(
            order=order,
            user_email=user_email,
            request=request
        )
        
        return payment_data

    except Exception as e:
        order.status = "PENDING"
        db.commit()
        
        print("\n" + "="*50)
        print(f"🔥 PAYTR GERÇEK HATA DETAYI: {str(e)}")
        print("="*50 + "\n")
        
        raise HTTPException(
            status_code=500, 
            detail=f"Ödeme oturumu oluşturulamadı: {str(e)}"
        )

# --- EKLEDİĞİMİZ VE ÇÖZÜMÜ SAĞLAYACAK KISIM BURASI ---

@router.post("/callback")
@router.post("/callback/")
async def paytr_callback(
    merchant_oid: str = Form(...),
    status: str = Form(...),
    total_amount: str = Form(...),
    hash: str = Form(...),
    db: Session = Depends(database.get_db)
):
    """
    PayTR ödeme bittiğinde bu endpoint'e POST isteği atar.
    Paranın askıdan inmesi için 'OK' dönmek şarttır.
    """
    try:
        # merchant_oid formatı paytr.py'de 'SP{id}' olarak belirlenmişti.
        order_id = int(merchant_oid.replace("SP", ""))
        order = db.query(models.Order).filter(models.Order.id == order_id).first()

        if not order:
            print(f"⚠️ Bildirim geldi ancak {merchant_oid} sistemde bulunamadı.")
            return PlainTextResponse("OK") # Sipariş olmasa da OK dönmelisin ki PayTR denemeyi bıraksın.

        if status == "success":
            # 💰 Ödeme başarılı
            order.status = "PAID"
            print(f"✅ Sipariş {merchant_oid} için ödeme BAŞARILI.")
        else:
            # ❌ Ödeme başarısız
            order.status = "FAILED"
            print(f"❌ Sipariş {merchant_oid} için ödeme BAŞARISIZ. Neden: {status}")

        db.commit()

        # 🚀 PAYTR PARAYI AKTARMAK İÇİN SADECE BUNU BEKLER:
        return PlainTextResponse("OK")

    except Exception as e:
        print(f"🔥 Callback İşleme Hatası: {str(e)}")
        # Hata olsa dahi OK dönmek, PayTR'ın sürekli tekrar istek atıp sunucuyu yormasını engeller.
        return PlainTextResponse("OK")
