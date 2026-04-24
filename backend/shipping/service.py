import os
import random
import string
import logging
from datetime import datetime

# =========================
# ENV CONFIG
# =========================

SHIPPING_API_KEY = os.getenv("SHIPPING_API_KEY")
SHIPPING_API_SECRET = os.getenv("SHIPPING_API_SECRET")

# Yurtiçi / MNG gibi provider seçimi (şimdilik default)
SHIPPING_PROVIDER = os.getenv("SHIPPING_PROVIDER", "YURTICI")

# Production safety flag
MOCK_MODE = not all([SHIPPING_API_KEY, SHIPPING_API_SECRET])

# Gönderici ödemeli sabit kural (senin case)
SHIPPING_PAYMENT_TYPE = "GO"


# =========================
# CORE SHIPMENT FUNCTION
# =========================

def create_shipment(order):
    """
    Creates shipment record after successful payment.
    Works in MOCK or REAL API mode.
    """

    try:
        # -------------------------
        # MOCK MODE (SAFE FALLBACK)
        # -------------------------
        if MOCK_MODE:
            tracking_number = "TRK" + ''.join(
                random.choices(string.ascii_uppercase + string.digits, k=10)
            )

            logging.warning(
                f"[MOCK SHIPPING] Order={order.id} Tracking={tracking_number}"
            )

            return tracking_number

        # -------------------------
        # REAL API MODE (YURTICI/MNG)
        # -------------------------
        logging.info(
            f"[SHIPPING API] Provider={SHIPPING_PROVIDER} Order={order.id}"
        )

        # Burada ileride Yurtiçi API call gelecek
        # örnek payload hazırlık (şimdiden hazır altyapı)

        payload = {
            "order_id": order.id,
            "receiver_name": getattr(order, "customer_name", "UNKNOWN"),
            "address": getattr(order, "address", "UNKNOWN"),
            "payment_type": SHIPPING_PAYMENT_TYPE,  # GÖ sabit
            "created_at": datetime.utcnow().isoformat()
        }

        # TODO: requests.post(YURTICI_API_URL, json=payload)

        # Şimdilik safe fallback ID (API bağlanana kadar)
        return "TRK_API_" + ''.join(
            random.choices(string.digits, k=10)
        )

    except Exception as e:
        logging.error(f"[SHIPPING ERROR] {str(e)}")

        # NEVER BREAK ORDER FLOW
        return "TRK_FALLBACK_" + ''.join(
            random.choices(string.digits, k=10)
        )


# =========================
# TRACKING STATUS
# =========================

def get_tracking_status(tracking_number: str):
    """
    Returns tracking status (mock or API-ready)
    """

    try:
        if MOCK_MODE:
            return {
                "status": "Yolda",
                "provider": "MOCK",
                "tracking_number": tracking_number
            }

        # REAL API CALL PLACEHOLDER
        # TODO: Yurtiçi tracking API request

        return {
            "status": "API_PENDING",
            "provider": SHIPPING_PROVIDER,
            "tracking_number": tracking_number
        }

    except Exception as e:
        logging.error(f"[TRACKING ERROR] {str(e)}")

        return {
            "status": "UNKNOWN",
            "tracking_number": tracking_number
        }
