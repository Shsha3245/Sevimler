import os
import hashlib
import hmac
import json
import logging

MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT")
TEST_MODE = os.getenv("PAYTR_TEST_MODE", "1")  # canlıda "0" olmalı

APP_ENV = os.getenv("ENV", "development")

MOCK_MODE = APP_ENV != "production" and not all(
    [MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]
)


def create_payment_session(order, user_email, user_ip):
    if MOCK_MODE:
        return {
            "token": f"MOCK_{order.id}",
            "mode": "MOCK"
        }

    if not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT]):
        raise Exception("PayTR credentials missing")

    try:
        payment_amount = int(order.total_price * 100)
        merchant_oid = str(order.id)

        # Sepet formatı: [[ürün adı, fiyat (kuruş), adet], ...]
        user_basket = []
        for item in order.items:
            user_basket.append([
                item.product.name,
                str(int(item.price_at_time * 100)),
                item.quantity
            ])

        basket_str = json.dumps(user_basket, ensure_ascii=False)
        basket_str = basket_str.encode("utf-8")
        basket_str = base64.b64encode(basket_str).decode("utf-8")

        # PayTR parametre sırası
        no_installment = "0"      # taksit yapılabilir
        max_installment = "12"    # en fazla 12 taksit
        currency = "TRY"

        hash_str = (
            MERCHANT_ID +
            user_ip +
            merchant_oid +
            user_email +
            str(payment_amount) +
            basket_str +
            no_installment +
            max_installment +
            currency +
            TEST_MODE
        )

        # HEX digest kullanılmalı
        token = hmac.new(
            MERCHANT_KEY.encode("utf-8"),
            (hash_str + MERCHANT_SALT).encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        return {
            "token": token,
            "merchant_oid": merchant_oid,
            "mode": "PRODUCTION"
        }

    except Exception as e:
        logging.error(f"PayTR ERROR: {str(e)}", exc_info=True)
        raise Exception("Payment failed")


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

        expected_hash = hmac.new(
            MERCHANT_KEY.encode("utf-8"),
            hash_str.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_hash, received_hash)

    except Exception as e:
        logging.error(f"Callback error: {str(e)}")
        return False
