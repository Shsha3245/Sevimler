import os
import base64
import hmac
import hashlib
import json

# .env bilgilerini alırken sağındaki solundaki boşlukları strip() ile temizliyoruz
MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID", "").strip()
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY", "").strip()
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT", "").strip()
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1").strip()

def create_payment_session(order, user_email, request):
    """
    PayTR Iframe API için kurallara %100 uygun token ve veri seti hazırlar.
    """
    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PAYTR ENV MISSING: .env dosyasındaki bilgileri kontrol edin.")

    try:
        # 1. PARAMETRELER (Kesinlikle string ve temiz olmalı)
        merchant_id = str(MERCHANT_ID)
        merchant_oid = str(order.id)
        email = str(user_email).strip()
        payment_amount = str(int(float(order.total_price) * 100)) # Kuruş hesabı (Örn: 285 TL -> 28500)
        
        no_installment = "0"
        max_installment = "0"
        currency = "TL"
        test_mode = str(TEST_MODE)

        # 2. IP ADRESİ TESPİTİ
        xff = request.headers.get("x-forwarded-for")
        user_ip = xff.split(",")[0].strip() if xff else request.client.host
        if user_ip in ["127.0.0.1", "::1", "localhost", "0.0.0.0"]:
            user_ip = "8.8.8.8" # Localhostta ise PayTR hata vermesin diye sahte dış IP

        # 3. SEPET OLUŞTURMA (JSON formatı PHP json_encode ile birebir eşleşmeli)
        basket_items = []
        for item in order.items:
            # PayTR sepet isimlerinde özel karakter veya tırnak istemez
            name = str(getattr(item.product, "name", "Urun")).replace('"', '').replace("'", "")
            price = "{:.2f}".format(float(item.price_at_time))
            qty = int(item.quantity or 1)
            basket_items.append([name, price, qty])

        if not basket_items:
            basket_items.append(["Alisveris Tutari", "{:.2f}".format(float(order.total_price)), 1])

        # Boşluksuz JSON tespiti ve Base64 encode
        json_basket = json.dumps(basket_items, separators=(',', ':'), ensure_ascii=False)
        user_basket = base64.b64encode(json_basket.encode("utf-8")).decode("utf-8")

        # 4. TOKEN OLUŞTURMA (PayTR Formülü - Sıralama Hayatidir)
        hash_str = (
            merchant_id +
            user_ip +
            merchant_oid +
            email +
            payment_amount +
            user_basket +
            no_installment +
            max_installment +
            currency +
            test_mode
        )

        # HMAC SHA256 şifreleme zinciri
        hash_authenticated = hash_str + MERCHANT_SALT
        paytr_token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                hash_authenticated.encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

        # 5. PAYTR'NİN BEKLEDİĞİ TAM DATA PAKETİ
        return {
            "merchant_id": merchant_id,
            "user_ip": user_ip,
            "merchant_oid": merchant_oid,
            "email": email,
            "payment_amount": payment_amount,
            "user_basket": user_basket,
            "paytr_token": paytr_token,
            "debug_on": "1",
            "no_installment": no_installment,
            "max_installment": max_installment,
            "currency": currency,
            "test_mode": test_mode,
            "merchant_ok_url": "https://sevimlerkuruyemis.com/success",
            "merchant_fail_url": "https://sevimlerkuruyemis.com/fail",
            "timeout_limit": "30"
        }
        
    except Exception as e:
        raise Exception(f"PayTR Veri Hazırlama Hatası: {str(e)}")
