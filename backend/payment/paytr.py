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
    # Çevresel değişken kontrolü
    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PAYTR ENV MISSING: Lütfen .env dosyasındaki bilgileri kontrol edin.")

    try:
        # 1. TUTAR: PayTR toplam tutarı kuruş cinsinden tam sayı bekler (Örn: 100.50 TL -> 10050)
        amount = str(int(float(order.total_price) * 100))
        oid = str(order.id)

        # 2. SEPET (BASKET): PayTR [isim, fiyat, adet] şeklinde bir liste yapısı bekler.
        # ÖNEMLİ: İsimler tırnak içermemeli, fiyatlar iki ondalıklı string olmalı ("10.50").
        basket_items = []
        for item in order.items:
            name = str(getattr(item.product, "name", "Ürün")).replace('"', '').replace("'", "")
            price = "{:.2f}".format(float(item.price_at_time))
            qty = int(item.quantity or 1)
            basket_items.append([name, price, qty])

        # Sepet verisi önce JSON'a çevrilir, sonra Base64 ile encode edilir.
        user_basket = base64.b64encode(
            json.dumps(basket_items).encode("utf-8")
        ).decode("utf-8")

        # 3. IP ADRESİ: Güvenli çekim ve Localhost kontrolü
        xff = request.headers.get("x-forwarded-for")
        user_ip = xff.split(",")[0].strip() if xff else request.client.host
        
        # Eğer localhost'ta test yapıyorsanız PayTR hata vermesin diye sahte bir gerçek IP basıyoruz
        if user_ip in ["127.0.0.1", "::1", "localhost"]:
            user_ip = "8.8.8.8"

        # 4. TOKEN OLUŞTURMA: Sıralama PayTR dökümantasyonuna göre sabittir.
        hash_str = (
            str(MERCHANT_ID) +
            user_ip +
            oid +
            str(user_email) +
            amount +
            user_basket +
            "0" + # no_installment (Taksit kapalı: 1, Açık: 0)
            "0" + # max_installment (Taksit sınırı)
            "TL" +
            str(TEST_MODE)
        )

        token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                (hash_str + MERCHANT_SALT).encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

    except Exception as e:
        raise Exception(f"PayTR Veri Hazırlama Hatası: {str(e)}")

    # Frontend'deki Iframe'in ihtiyacı olan tüm parametreler
    return {
        "merchant_id": MERCHANT_ID,
        "user_ip": user_ip,
        "merchant_oid": oid,
        "email": str(user_email),
        "payment_amount": amount,
        "user_basket": user_basket,
        "paytr_token": token,
        "debug_on": "1", # Geliştirme aşamasında hataları görmek için '1' kalsın
        "no_installment": "0",
        "max_installment": "0",
        "currency": "TL",
        "test_mode": TEST_MODE,
        "merchant_ok_url": "https://sevimlerkuruyemis.com/success",
        "merchant_fail_url": "https://sevimlerkuruyemis.com/fail",
        "timeout_limit": "30"
    }
