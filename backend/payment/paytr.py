import os
import base64
import hmac
import hashlib
import json
import logging

logger = logging.getLogger("paytr")

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID", "")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY", "")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT", "")
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1")

# Eğer env eksikse mock mode
MOCK_MODE = not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT])


def create_payment_session(order, user_email, user_ip):

    try:
        # ---------------- MOCK ----------------
        if MOCK_MODE:
            logger.warning("PAYTR MOCK MODE ACTIVE")
            return {
                "token": f"MOCK_{order.id}",
                "mode": "MOCK"
            }

        # ---------------- SAFE DATA ----------------
        merchant_oid = str(order.id)
        payment_amount = int(float(order.total_price or 0) * 100)

        if not user_ip:
            user_ip = "127.0.0.1"

        if not user_email:
            user_email = "noemail@example.com"

        # ---------------- BASKET SAFE BUILD ----------------
        user_basket = []

        try:
            for item in getattr(order, "items", []) or []:
                product_name = getattr(getattr(item, "product", None), "name", "product")

                price = getattr(item, "price_at_time", 0)
                quantity = getattr(item, "quantity", 1)

                price = int(float(price or 0) * 100)
                quantity = int(quantity or 1)

                user_basket.append([product_name, str(price), quantity])

        except Exception as e:
            logger.error(f"Basket build error: {e}")
            user_basket = [["product", "100", 1]]

        basket_encoded = base64.b64encode(
            json.dumps(user_basket, ensure_ascii=False).encode("utf-8")
        ).decode("utf-8")

        # ---------------- HASH STRING (PAYTR EXACT ORDER) ----------------
        hash_str = (
            MERCHANT_ID +
            user_ip +
            merchant_oid +
            user_email +
            str(payment_amount) +
            basket_encoded +
            "0" +
            "0" +
            "TRY" +
            TEST_MODE
        )

        # ---------------- TOKEN ----------------
        token = base64.b64encode(
            hmac.new(
                MERCHANT_KEY.encode("utf-8"),
                (hash_str + MERCHANT_SALT).encode("utf-8"),
                hashlib.sha256
            ).digest()
        ).decode("utf-8")

        logger.info(f"PAYTR TOKEN GENERATED: {merchant_oid}")

        return {
            "token": token,
            "merchant_oid": merchant_oid,
            "mode": "PRODUCTION"
        }

    except Exception as e:
        logger.error(f"PAYTR FATAL ERROR: {e}", exc_info=True)
        raise Exception("PAYTR payment session failed")
