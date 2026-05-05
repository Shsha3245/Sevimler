import os
import base64
import hmac
import hashlib
import json

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID", "").strip()
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY", "").strip()
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT", "").strip()
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "0").strip()

def create_payment_session(order, user_email, request):
    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PAYTR ENV MISSING: .env dosyasındaki bilgileri kontrol edin.")

    try:
        merchant_id = str(MERCHANT_ID)
        merchant_oid = str(order.id)
        email = str(user_email).strip()
        
        # Genel toplam tutarı kesin olarak kuruşa çeviriyoruz
        total_price_float = float(order.total_price)
        payment_amount = str(int(round(total_price_float * 100)))
        
        no_installment = "0"
        max_installment = "0"
        currency = "TL"
        test_mode = str(TEST_MODE)

        # IP Temizliği
        xff = request.headers.get("x-forwarded-for")
        user_ip = xff.split(",")[0].strip() if xff else request.client.host
        if ":" in user_ip or user_ip in ["127.0.0.1", "localhost", "0.0.0.0"]:
            user_ip = "176.234.0.1"

        # KRİTİK DEĞİŞİKLİK: 400 hatasını engellemek için sepeti tek parça gönderiyoruz.
        # Böylece ürün fiyatlarının toplamı ile genel toplam uyuşmazlığı riski %0 oluyor.
        basket_price = "{:.2f}".format(total_price_float)
        basket_items = [["Siparis Bedeli", basket_price, 1]]

        # PHP json_encode uyumluluğu
        json_basket = json.dumps(basket_items, separators=(',', ':'), ensure_ascii=False)
        user_basket = base64.b64encode(json_basket.encode("utf-8")).decode("utf-8")

        # HASH FORMÜLÜ
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

        hash_authenticated = hash_str + MERCHANT_SALT
        paytr_token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                hash_authenticated.encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

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
