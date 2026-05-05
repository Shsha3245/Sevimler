import os
import base64
import hmac
import hashlib
import json

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT")
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1")

def create_payment_session(order, user_email, request):
    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PAYTR ENV MISSING")

    try:
        # 1. TUTAR: Kuruş cinsinden tam sayı olmalı
        amount = str(int(float(order.total_price) * 100))
        oid = str(order.id)

        # 2. SEPET: PayTR her bir öğeyi [isim, fiyat, adet] listesi olarak bekler
        basket = []
        for item in order.items:
            # ÖNEMLİ: Fiyat string olmalı ve kuruşlu hali gelmeli (Örn: "10.50")
            name = str(getattr(item.product, "name", "Urun")).replace('"', '').replace("'", "")
            price = "{:.2f}".format(float(item.price_at_time)) 
            qty = int(item.quantity or 1)
            basket.append([name, price, qty])

        user_basket = base64.b64encode(json.dumps(basket).encode("utf-8")).decode("utf-8")

        # 3. IP ADRESİ: Lokal testlerde hata almamak için kontrol
        user_ip = request.client.host
        if user_ip in ["127.0.0.1", "::1", "localhost"]:
            user_ip = "8.8.8.8" # Test sırasında hata almamak için gerçekçi bir IP

        # 4. TOKEN OLUŞTURMA
        hash_str = (
            str(MERCHANT_ID) + user_ip + oid + str(user_email) + amount + 
            user_basket + "0" + "0" + "TL" + str(TEST_MODE)
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
            "no_installment": "0",
            "max_installment": "0",
            "currency": "TL",
            "test_mode": TEST_MODE,
            "merchant_ok_url": "https://sevimlerkuruyemis.com/success",
            "merchant_fail_url": "https://sevimlerkuruyemis.com/fail",
            "timeout_limit": "30"
        }
    except Exception as e:
        raise Exception(f"PayTR Hazırlık Hatası: {str(e)}")
