import os
import hashlib
import base64
import hmac
import json
import logging

# PayTR Credentials
MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID")
MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY")
MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT")

# Mock Mode Configuration
MOCK_MODE = not all([MERCHANT_ID, MERCHANT_KEY, MERCHANT_SALT])

def create_payment_session(order, user_email, user_ip="127.0.0.1"):
    """
    Creates a PayTR payment session/token.
    If credentials missing, returns a MOCK token.
    """
    if MOCK_MODE:
        logging.info(f"PAYTR: Mock session created for Order ID: {order.id}")
        return {"token": f"MOCK_TOKEN_{order.id}", "merchant_id": "MOCK_MID", "mode": "MOCK"}

    try:
        payment_amount = int(order.total_price * 100) # TL to Kurus
        merchant_oid = str(order.id)
        
        user_basket = []
        for item in order.items:
            # We assume product info is available via relationship
            user_basket.append([item.product.name, str(item.price_at_time), item.quantity])
        
        user_basket_json = json.dumps(user_basket)
        
        # Hash Generation (PayTR Standard)
        # MERCHANT_ID + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
        hash_str = MERCHANT_ID + user_ip + merchant_oid + user_email + str(payment_amount) + user_basket_json + "0" + "0" + "TRY" + "0"
        paytr_token = base64.b64encode(hmac.new(MERCHANT_KEY.encode(), (hash_str + MERCHANT_SALT).encode(), hashlib.sha256).digest()).decode()
        
        return {
            "token": paytr_token, 
            "merchant_id": MERCHANT_ID,
            "mode": "PRODUCTION"
        }
    except Exception as e:
        logging.error(f"PayTR session creation error: {str(e)}")
        # Production Safety: Always fallback to Mock instead of crashing
        return {"token": f"MOCK_ERROR_FALLBACK_{order.id}", "merchant_id": "MOCK_MID", "mode": "MOCK"}

def verify_callback(data):
    """
    Verifies PayTR POST callback hash.
    """
    if MOCK_MODE:
        return True # Always valid in mock mode

    merchant_oid = data.get("merchant_oid")
    status = data.get("status")
    total_amount = data.get("total_amount")
    hash_received = data.get("hash")
    
    if not all([merchant_oid, status, total_amount, hash_received]):
        return False

    hash_str = merchant_oid + MERCHANT_SALT + status + total_amount
    expected_hash = base64.b64encode(hmac.new(MERCHANT_KEY.encode(), hash_str.encode(), hashlib.sha256).digest()).decode()
    
    return hash_received == expected_hash
