import os
import base64
import hmac
import hashlib
import json
import logging

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT")
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1")

MOCK = not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT])


def create_payment_session(order, user_email, user_ip):

    if MOCK:
        return {
            "token": f"MOCK_{order.id}",
            "mode": "MOCK"
        }

    try:
        amount = int(float(order.total_price) * 100)
        oid = str(order.id)

        basket = []

        # SAFE LOAD (relationship crash fix)
        for item in order.items:
            name = getattr(item.product, "name", "product")
            price = int(float(item.price_at_time or 0) * 100)
            qty = int(item.quantity or 1)
            basket.append([name, str(price), qty])

        basket_encoded = base64.b64encode(
            json.dumps(basket).encode()
        ).decode()

        if not user_ip:
            user_ip = "127.0.0.1"

        hash_str = (
            MERCHANT_ID +
            user_ip +
            oid +
            user_email +
            str(amount) +
            basket_encoded +
            "0" +
            "0" +
            "TRY" +
            TEST_MODE
        )

        token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode(),
                (hash_str + MERCHANT_SALT).encode(),
                hashlib.sha256
            ).digest()
        ).decode()

        return {
            "token": token,
            "mode": "PRODUCTION"
        }

    except Exception as e:
        logging.error(e, exc_info=True)
        raise Exception("PAYTR ERROR")
