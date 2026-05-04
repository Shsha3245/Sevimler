import os
import base64
import hmac
import hashlib
import json

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT")
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1")


def create_payment_session(order, user_email, user_ip):

    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PAYTR ENV MISSING")

    try:
        # ✅ toplam tutar (kuruş)
        amount = str(int(float(order.total_price) * 100))
        oid = str(order.id)

        # ✅ basket (TL olarak, çarpma YOK)
        basket = []
        for item in order.items:
            name = str(getattr(item.product, "name", "urun"))
            price = str(float(item.price_at_time))  # ❗ 100 ile çarpma
            qty = int(item.quantity or 1)
            basket.append([name, price, qty])

        user_basket = base64.b64encode(
            json.dumps(basket).encode("utf-8")
        ).decode("utf-8")

        user_ip = str(user_ip or "127.0.0.1")
        user_email = str(user_email)

        # ✅ DOĞRU HASH FORMAT
        hash_str = (
            str(MERCHANT_ID) +
            user_ip +
            oid +
            user_email +
            amount +
            user_basket +
            "0" +          # no_installment
            "0" +          # max_installment
            "TL" +         # ❗ TRY DEĞİL
            TEST_MODE
        )

        token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                (hash_str + MERCHANT_SALT).encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

        # ✅ frontend'e dönecek sade response
        return {
            "token": token,
            "merchant_oid": oid
        }

    except Exception as e:
        raise Exception(f"PAYTR ERROR: {str(e)}")
