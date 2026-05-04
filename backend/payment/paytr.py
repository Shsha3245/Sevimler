import os
import hashlib
import base64
import hmac
import json
import logging

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID", "")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY", "")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT", "")
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1")
APP_ENV = os.getenv("ENV", "development")

MOCK_MODE = APP_ENV != "production" and not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT])


def create_payment_session(order, user_email, user_ip):

    if MOCK_MODE:
        return {
            "token": f"MOCK_{order.id}",
            "mode": "MOCK"
        }

    if not MERCHANT_ID or not MERCHANT_KEY or not MERCHANT_SALT:
        raise Exception("PAYTR ENV MISSING")

    try:
        payment_amount = int(float(order.total_price) * 100)
        merchant_oid = str(order.id)

        # SAFE BASKET
        user_basket = []

        for item in order.items:
            name = getattr(item.product, "name", "Urun")
            price = int(float(getattr(item, "price_at_time", 0)) * 100)
            qty = int(getattr(item, "quantity", 1))

            user_basket.append([name, str(price), qty])

        user_basket_encoded = base64.b64encode(
            json.dumps(user_basket).encode("utf-8")
        ).decode("utf-8")

        # SAFE IP fallback
        if not user_ip:
            user_ip = "127.0.0.1"

        hash_str = (
            MERCHANT_ID +
            user_ip +
            merchant_oid +
            user_email +
            str(payment_amount) +
            user_basket_encoded +
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
            "merchant_oid": merchant_oid,
            "mode": "PRODUCTION"
        }

    except Exception as e:
        logging.error(f"PAYTR ERROR: {e}", exc_info=True)
        raise Exception("Payment failed")
