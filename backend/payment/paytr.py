import os
import hashlib
import base64
import hmac
import json
import logging
import urllib.parse

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT")
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1")
ENV = os.getenv("ENV", "development")

MOCK_MODE = ENV != "production" or not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT])


# -------------------------------
# CREATE PAYMENT SESSION (FIXED PAYTR STANDARD)
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
        merchant_oid = str(order.id)

        # ---------------- AMOUNT (KURUŞ)
        payment_amount = int(float(order.total_price) * 100)

        # ---------------- BASKET (PAYTR SAFE FORMAT)
        user_basket = []
        for item in order.items:
            user_basket.append([
                str(item.product.name)[:100],
                str(int(float(item.price_at_time) * 100)),
                int(item.quantity)
            ])

        user_basket_str = base64.b64encode(
            json.dumps(user_basket, ensure_ascii=False).encode("utf-8")
        ).decode("utf-8")

        # ---------------- HASH STRING (PAYTR OFFICIAL ORDER)
        hash_str = (
            MERCHANT_ID +
            user_ip +
            merchant_oid +
            user_email +
            str(payment_amount) +
            user_basket_str +
            "0" +   # no_installment
            "0" +   # max_installment
            "TRY" +
            TEST_MODE
        )

        # ---------------- TOKEN
        token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                (hash_str + MERCHANT_SALT).encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

        return {
            "token": token,
            "merchant_oid": merchant_oid,
            "amount": payment_amount,
            "mode": "PRODUCTION"
        }

    except Exception as e:
        logging.error(f"PAYTR ERROR: {str(e)}", exc_info=True)
        raise Exception("Payment session failed")


# -------------------------------
# CALLBACK VERIFY (FIXED SAFE)
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
        logging.error(f"CALLBACK ERROR: {str(e)}")
        return False
