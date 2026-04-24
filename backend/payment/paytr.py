import os
import hashlib
import base64
import hmac
import json
import logging

# ENV
MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT")
APP_ENV = os.getenv("ENV", "development")

# MOCK sadece development'ta aktif
MOCK_MODE = APP_ENV != "production" and not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT])


# -------------------------------
# CREATE PAYMENT SESSION
# -------------------------------
def create_payment_session(order, user_email, user_ip="127.0.0.1"):
    """
    PayTR token oluşturur
    """

    if MOCK_MODE:
        logging.warning(f"[MOCK PAYTR] Order {order.id}")
        return {
            "token": f"MOCK_TOKEN_{order.id}",
            "merchant_id": "MOCK_MID",
            "mode": "MOCK"
        }

    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PayTR credentials missing")

    try:
        payment_amount = int(order.total_price * 100)  # TL → kuruş
        merchant_oid = str(order.id)

        # Basket oluştur
        user_basket = []
        for item in order.items:
            user_basket.append([
                item.product.name,
                str(item.price_at_time),
                item.quantity
            ])

        user_basket_json = json.dumps(user_basket)
        user_basket_encoded = base64.b64encode(user_basket_json.encode()).decode()

        # HASH STRING
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
            "0"     # test_mode (0 = live)
        )

        # TOKEN
        paytr_token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode(),
                (hash_str + MERCHANT_SALT).encode(),
                hashlib.sha256
            ).digest()
        ).decode()

        return {
            "token": paytr_token,
            "merchant_id": MERCHANT_ID,
            "merchant_oid": merchant_oid,
            "email": user_email,
            "payment_amount": payment_amount,
            "currency": "TRY",
            "mode": "PRODUCTION"
        }

    except Exception as e:
        logging.error(f"PayTR session creation error: {str(e)}")
        raise Exception("Payment session creation failed")


# -------------------------------
# VERIFY CALLBACK
# -------------------------------
def verify_callback(data):
    """
    PayTR callback doğrulama
    """

    if MOCK_MODE:
        logging.warning("MOCK MODE: callback auto-approved")
        return True

    try:
        merchant_oid = data.get("merchant_oid")
        status = data.get("status")
        total_amount = data.get("total_amount")
        hash_received = data.get("hash")

        if not all([merchant_oid, status, total_amount, hash_received]):
            return False

        hash_str = merchant_oid + MERCHANT_SALT + status + total_amount

        expected_hash = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode(),
                hash_str.encode(),
                hashlib.sha256
            ).digest()
        ).decode()

        # timing attack safe compare
        return hmac.compare_digest(hash_received, expected_hash)

    except Exception as e:
        logging.error(f"Callback verification error: {str(e)}")
        return False
