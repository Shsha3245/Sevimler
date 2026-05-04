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
# PAYMENT SESSION
# -------------------------------
def create_payment_session(order, user_email, user_ip):

    # MOCK MODE (ENV eksikse güvenli fallback)
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
            amount = int(float(order.total_price) * 100)
        except Exception:
            amount = 0

        oid = str(order.id)

        # -----------------------
        # SAFE EMAIL
        # -----------------------
        if not user_email:
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
                    price = int(float(getattr(item, "price_at_time", 0) or 0) * 100)
                    qty = int(getattr(item, "quantity", 1))

                    basket.append([name, str(price), qty])
                except Exception:
                    continue

        # fallback (empty basket fix)
        if not basket:
            basket = [["product", "0", 1]]

        basket_encoded = base64.b64encode(
            json.dumps(basket, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        ).decode("utf-8")

        # -----------------------
        # HASH STRING (ORDER SENSITIVE)
        # -----------------------
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

        # -----------------------
        # TOKEN GENERATION
        # -----------------------
        token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                (hash_str + MERCHANT_SALT).encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

        return {
            "token": token,
            "merchant_oid": oid,
            "mode": "PRODUCTION"
        }

    except Exception as e:
        logging.error(f"PAYTR ERROR: {str(e)}", exc_info=True)
        raise Exception("PAYTR PAYMENT FAILED")
