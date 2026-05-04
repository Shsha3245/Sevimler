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


def create_payment_session(order, user_email, user_ip):

    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PAYTR ENV MISSING")

    try:
        # amount (KURUŞ)
        payment_amount = str(int(float(order.total_price) * 100))
        merchant_oid = str(order.id)

        # basket
        user_basket = []
        for item in order.items:
            name = item.product.name if item.product else "urun"
            price = str(int(float(item.price_at_time) * 100))
            qty = int(item.quantity or 1)

            user_basket.append([name, price, qty])

        user_basket_encoded = base64.b64encode(
            json.dumps(user_basket).encode("utf-8")
        ).decode("utf-8")

        user_ip = user_ip or "127.0.0.1"

        # PAYTR HASH (CRITICAL ORDER)
        hash_str = (
            MERCHANT_ID +
            user_ip +
            merchant_oid +
            user_email +
            payment_amount +
            user_basket_encoded +
            "0" +   # no_installment
            "0" +   # max_installment
            "TL" +
            TEST_MODE
        )

        paytr_token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode(),
                (hash_str + MERCHANT_SALT).encode(),
                hashlib.sha256
            ).digest()
        ).decode()

        # IMPORTANT: THIS IS NOT REDIRECT TOKEN
        return {
            "token": paytr_token,
            "merchant_oid": merchant_oid,
            "amount": payment_amount,
            "mode": "TEST" if TEST_MODE == "1" else "LIVE"
        }

    except Exception as e:
        logging.error(f"PAYTR ERROR: {e}", exc_info=True)
        raise Exception("PAYTR PAYMENT FAILED")
