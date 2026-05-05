import os
import base64
import hmac
import hashlib
import json

# .env dosyasından gelen bilgiler
MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT")
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1")

def create_payment_session(order, user_email, request):
    """
    PayTR Iframe API için gerekli token ve session verilerini hazırlar.
    """
    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PAYTR ENV MISSING: .env dosyasını kontrol edin.")

    try:
        # 1. TUTAR: Kuruş cinsinden tam sayı (10.50 TL -> 1050)
        amount = str(int(float(order.total_price) * 100))
        oid = str(order.id)

        # 2. SEPET (BASKET): 
        # PayTR [isim, fiyat, adet] şeklinde bir liste bekler.
        basket_items = []
        for item in order.items:
            name = str(getattr(item.product, "name", "Ürün")).replace('"', '').replace("'", "")
            price = "{:.2f}".format(float(item.price_at_time))
            qty = int(item.quantity or 1)
            basket_items.append([name, price, qty])

        # Eğer sepet boş kaldıysa PayTR 400 hatası verir, bunu engellemek için:
        if not basket_items:
            basket_items.append(["Sepet Tutarı", "{:.2f}".format(float(order.total_price)), 1])

        # PHP'deki json_encode ile birebir aynı çıktıyı veren temizleme formatı
        user_basket = base64.b64encode(
            json.dumps(basket_items, separators=(',', ':')).encode("utf-8")
        ).decode("utf-8")

        # 3. IP ADRESİ: 
        xff = request.headers.get("x-forwarded-for")
        user_ip = xff.split(",")[0].strip() if xff else request.client.host
        
        # Localhost koruması (PayTR 127.0.0.1 kabul etmez)
        if user_ip in ["127.0.0.1", "::1", "localhost"]:
            user_ip = "8.8.8.8"

        # 4. SABİT DEĞERLER (Return objesiyle birebir aynı olmak zorundadır)
        no_installment = "0"
        max_installment = "0"
        currency = "TL"

        # 5. TOKEN OLUŞTURMA: Sıralama asla değiştirilemez.
        hash_str = (
            str(MERCHANT_ID) +
            user_ip +
            oid +
            str(user_email) +
            amount +
            user_basket +
            no_installment +
            max_installment +
            currency +
            str(TEST_MODE)
        )

        token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                (hash_str + MERCHANT_SALT).encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

        return {
            "merchant_id": MERCHANT_ID,
            "user_ip": user_ip,
            "merchant_oid": oid,
            "email": str(user_email),
            "payment_amount": amount,
            "user_basket": user_basket,
            "paytr_token": token,
            "debug_on": "1",
            "no_installment": no_installment,
            "max_installment": max_installment,
            "currency": currency,
            "test_mode": TEST_MODE,
            "merchant_ok_url": "https://sevimlerkuruyemis.com/success",
            "merchant_fail_url": "https://sevimlerkuruyemis.com/fail",
            "timeout_limit": "30"
        }
    except Exception as e:
        raise Exception(f"PayTR Veri Hazırlama Hatası: {str(e)}")
