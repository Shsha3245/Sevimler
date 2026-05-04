import os
import base64
import hmac
import hashlib
import json
import logging

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID", "")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY", "")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT", "")
TEST_MODE = str(os.getenv("PAYTR_TEST_MODE", "1"))

MOCK_MODE = not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT])


# -------------------------------
# CREATE PAYMENT SESSION
# -------------------------------
def create_payment_session(order, user_email, user_ip):

    # MOCK MODE
    if MOCK_MODE:
        return {
            "token": f"MOCK_{order.id}",
            "mode": "MOCK"
        }

    try:
        # -----------------------
        # SAFE AMOUNT
        # -----------------------
        try:
            amount_raw = order.total_price or 0
            amount = int(float(amount_raw) * 100)
        except:
            amount = 0

        merchant_oid = str(order.id)

        # -----------------------
        # SAFE EMAIL
        # -----------------------
        if not user_email or user_email.strip() == "":
            user_email = "test@example.com"

        # -----------------------
        # SAFE IP
        # -----------------------
        if not user_ip:
            user_ip = "127.0.0.1"
        else:
            user_ip = user_ip.split(",")[0].strip()

        # -----------------------
        # SAFE BASKET
        # -----------------------
        basket = []

        if hasattr(order, "items") and order.items:
            for item in order.items:
                try:
                    name = getattr(item.product, "name", "product")
                    price = item.price_at_time or 0
                    qty = item.quantity or 1

                    price = int(float(price) * 100)

                    basket.append([name, str(price), int(qty)])
                except:
                    continue

        # fallback (PayTR rejects empty basket sometimes)
        if len(basket) == 0:
            basket = [["product", "0", 1]]

        basket_encoded = base64.b64encode(
            json.dumps(basket, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        ).decode("utf-8")

        # -------------------------------
        # HASH STRING (CRITICAL ORDER FIXED)
        # -------------------------------
        hash_str = (
            MERCHANT_ID +
            user_ip +
            merchant_oid +
            user_email +
            str(amount) +
            basket_encoded +
            "0" +   # no_installment
            "0" +   # max_installment
            "TRY" +
            TEST_MODE
        )

        # -------------------------------
        # TOKEN
        # -------------------------------
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
            "mode": "PRODUCTION"
        }

    except Exception as e:
        logging.error(f"PAYTR ERROR: {str(e)}", exc_info=True)
        raise Exception("PAYTR PAYMENT FAILED")
