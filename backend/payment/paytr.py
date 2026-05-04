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
        amount = str(int(float(order.total_price) * 100))
        oid = str(order.id)

        basket = []
        for item in order.items:
            name = str(getattr(item.product, "name", "urun"))
            price = str(float(item.price_at_time))
            qty = int(item.quantity or 1)
            basket.append([name, price, qty])

        user_basket = base64.b64encode(
            json.dumps(basket).encode("utf-8")
        ).decode("utf-8")

        ip = request.headers.get("x-forwarded-for", request.client.host)
        user_ip = ip.split(",")[0].strip()
        user_email = str(user_email)

        hash_str = (
            str(MERCHANT_ID) +
            user_ip +
            oid +
            user_email +
            amount +
            user_basket +
            "0" +
            "0" +
            "TL" +
            TEST_MODE
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
            "email": user_email,
            "payment_amount": amount,
            "user_basket": user_basket,
            "paytr_token": token,
            "debug_on": "0",  # PROD
            "no_installment": "0",
            "max_installment": "0",
            "currency": "TL",
            "test_mode": TEST_MODE,
            "merchant_ok_url": "https://sevimlerkuruyemis.com/success",
            "merchant_fail_url": "https://sevimlerkuruyemis.com/fail",
            "timeout_limit": "30"
        }

    except Exception as e:
        raise Exception(f"PAYTR ERROR: {str(e)}")
