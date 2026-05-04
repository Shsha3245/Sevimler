import os
import base64
import hmac
import hashlib
import json
import logging

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT")
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1")  # "1" test, "0" live


def create_payment_session(order, user_email, user_ip):

    try:
        if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
            raise Exception("PAYTR ENV MISSING")

        amount = str(int(float(order.total_price) * 100))
        oid = str(order.id)

        basket = []

        for item in order.items:
            name = item.product.name if item.product else "urun"
            price = str(int(float(item.price_at_time)))
            qty = int(item.quantity or 1)
            basket.append([name, price, qty])

        basket_encoded = base64.b64encode(
            json.dumps(basket).encode("utf-8")
        ).decode("utf-8")

        user_ip = user_ip or "127.0.0.1"

        hash_str = f"{MERCHANT_ID}{user_ip}{oid}{user_email}{amount}{basket_encoded}0{TEST_MODE}"

        paytr_token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode(),
                (hash_str + MERCHANT_SALT).encode(),
                hashlib.sha256
            ).digest()
        ).decode()

        return {
            "token": paytr_token,
            "merchant_oid": oid,
            "mode": "TEST" if TEST_MODE == "1" else "LIVE"
        }

    except Exception as e:
        logging.error(f"PAYTR ERROR: {e}", exc_info=True)
        raise Exception("PAYTR PAYMENT FAILED")
