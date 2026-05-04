import os
import hashlib
import base64
import hmac
import json
import logging

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT")
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1")
APP_ENV = os.getenv("ENV", "development")

MOCK_MODE = APP_ENV != "production" and not all([
    MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT
])


def create_payment_session(order, user_email, user_ip):

    if MOCK_MODE:
        return {
            "token": f"MOCK_{order.id}",
            "mode": "MOCK"
        }

    try:
        payment_amount = int(order.total_price * 100)
        merchant_oid = str(order.id)

        user_basket = []
        for item in order.items:
            user_basket.append([
                item.product.name,
                str(int(item.price_at_time * 100)),
                item.quantity
            ])

        user_basket_str = base64.b64encode(
            json.dumps(user_basket).encode()
        ).decode()

        hash_str = (
            MERCHANT_ID +
            user_ip +
            merchant_oid +
            user_email +
            str(payment_amount) +
            user_basket_str +
            "0" +
            "0" +
            "TRY" +
            TEST_MODE
        )

        paytr_token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode(),
                (hash_str + MERCHANT_SALT).encode(),
                hashlib.sha256
            ).digest()
        ).decode()

        return {
            "token": paytr_token,
            "mode": "PRODUCTION"
        }

    except Exception as e:
        logging.error("PayTR ERROR", exc_info=True)
        raise Exception("Payment failed")


def verify_callback(data):

    if MOCK_MODE:
        return True

    try:
        merchant_oid = data.get("merchant_oid")
        status = data.get("status")
        total_amount = data.get("total_amount")
        received_hash = data.get("hash")

        hash_str = merchant_oid + MERCHANT_SALT + status + total_amount

        expected_hash = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode(),
                hash_str.encode(),
                hashlib.sha256
            ).digest()
        ).decode()

        return hmac.compare_digest(expected_hash, received_hash)

    except Exception:
        return False
