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

@router.api_route("/callback", methods=["GET", "POST"], response_class=PlainTextResponse)
@router.api_route("/callback/", methods=["GET", "POST"], response_class=PlainTextResponse)
async def paytr_callback(request: Request, db: Session = Depends(database.get_db)):
    """
    PayTR ödeme bildirimi endpoint'i.
    Hem GET hem POST destekler, Form verilerini manuel ayıklar.
    """
    # Log: İsteğin nasıl geldiğini gör
    print(f"--- BİLDİRİM GELDİ | Metot: {request.method} ---")
    
    try:
        # Form verilerini manuel alıyoruz (FastAPI doğrulamasına takılmamak için)
        form_data = await request.form()
        
        merchant_oid = form_data.get("merchant_oid")
        status = form_data.get("status")
        # total_amount ve hash_val gerekirse buradan alınabilir (form_data.get("hash"))

        # Eğer GET ile boş gelmişse veya veri yoksa sadece OK dön
        if not merchant_oid:
            print("⚠️ Bildirim verisi boş geldi (Muhtemelen boş bir GET isteği).")
            return PlainTextResponse("OK")

        # Log: Gelen veriyi bas
        print(f"--- İşlenen OID: {merchant_oid} | Durum: {status} ---")

        # 1. Siparişi Bul
        try:
            order_id = int(merchant_oid.replace("SP", ""))
        except (ValueError, AttributeError):
            print(f"❌ Geçersiz merchant_oid formatı: {merchant_oid}")
            return PlainTextResponse("OK")

        order = db.query(models.Order).filter(models.Order.id == order_id).first()

        if not order:
            print(f"⚠️ Bildirim geldi ancak {merchant_oid} veritabanında bulunamadı.")
            return PlainTextResponse("OK")

        # 2. Durum Güncelleme
        if status == "success":
            order.status = "PAID"
            print(f"✅ Sipariş {merchant_oid} için ödeme BAŞARILI.")
        else:
            order.status = "FAILED"
            print(f"❌ Sipariş {merchant_oid} için ödeme BAŞARISIZ. Neden: {status}")

        db.commit()
        return PlainTextResponse("OK")

    except Exception as e:
        print(f"🔥 Callback İşleme Hatası: {str(e)}")
        # Hata olsa dahi PayTR'a OK dönüyoruz ki döngüye girmesin
        return PlainTextResponse("OK")
        print(f"🔥 Callback İşleme Hatası: {str(e)}")
        # Hata olsa dahi OK dönmek, PayTR'ın sürekli tekrar istek atıp sunucuyu yormasını engeller.
        return PlainTextResponse("OK")
