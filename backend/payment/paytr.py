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


# -------------------------------
# CREATE PAYMENT SESSION
# -------------------------------
def create_payment_session(order, user_email, user_ip):

    if MOCK_MODE:
        logging.warning(f"[MOCK PAYTR] Order {order.id}")
        return {
            "token": f"MOCK_{order.id}",
            "mode": "MOCK"
        }

    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PayTR credentials missing")

    try:
        payment_amount = int(order.total_price * 100)
        merchant_oid = str(order.id)

        # -------------------------------
        # BASKET (PayTR FORMAT FIX)
        # -------------------------------
        user_basket = []

        for item in order.items:
            user_basket.append([
                item.product.name,
                str(int(item.price_at_time * 100)),  # kuruş
                item.quantity
            ])

        user_basket_encoded = base64.b64encode(
            json.dumps(user_basket).encode("utf-8")
        ).decode("utf-8")

        # -------------------------------
        # HASH STRING (ORDER IMPORTANT)
        # -------------------------------
        hash_str = (
            MERCHANT_ID +
            user_ip +
            merchant_oid +
            user_email +
            str(payment_amount) +
            user_basket_encoded +
            "0" +   # no_installment
            "0" +   # max_installment
            "TRY" +
            TEST_MODE
        )

        # -------------------------------
        # TOKEN
        # -------------------------------
        paytr_token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                (hash_str + MERCHANT_SALT).encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

        return {
            "token": paytr_token,
            "merchant_oid": merchant_oid,
            "email": user_email,
            "payment_amount": payment_amount,
            "currency": "TRY",
            "mode": "PRODUCTION"
        }

    except Exception as e:
        logging.error(f"PayTR ERROR: {str(e)}", exc_info=True)
        raise Exception("Payment failed")


# -------------------------------
# VERIFY CALLBACK
# -------------------------------
def verify_callback(data):

    if MOCK_MODE:
        return True

    try:
        merchant_oid = data.get("merchant_oid")
        status = data.get("status")
        total_amount = data.get("total_amount")
        received_hash = data.get("hash")

        if not all([merchant_oid, status, total_amount, received_hash]):
            return False

        hash_str = merchant_oid + MERCHANT_SALT + status + total_amount

        expected_hash = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                hash_str.encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

        return hmac.compare_digest(expected_hash, received_hash)

    except Exception as e:
        logging.error(f"Callback error: {str(e)}")
        return False
