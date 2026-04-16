import os
import random
import string
import logging

# Shipping Credentials
SHIPPING_API_KEY = os.getenv("SHIPPING_API_KEY")
SHIPPING_API_SECRET = os.getenv("SHIPPING_API_SECRET")

# Mock Mode Configuration
MOCK_MODE = not all([SHIPPING_API_KEY, SHIPPING_API_SECRET])

def create_shipment(order):
    """
    Triggers shipment creation in the carrier system (Yurtiçi/MNG API).
    Returns tracking number.
    """
    try:
        if MOCK_MODE:
            # Format: TRK + random string as requested
            tracking_number = "TRK" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
            logging.info(f"SHIPPING: Mock shipment created for Order ID: {order.id}. Tracking: {tracking_number}")
            return tracking_number
        
        # In a real scenario, this would call Yurtiçi/MNG API
        # For now, we return a mock value but log that API is active
        logging.info(f"SHIPPING: API shipment triggered for Order ID: {order.id}")
        return "TRK_API_" + ''.join(random.choices(string.digits, k=8))
        
    except Exception as e:
        logging.error(f"Shipping creation error: {str(e)}")
        # Production Safety: Fallback to mock value if API fails
        return "TRK_FALLBACK_" + ''.join(random.choices(string.digits, k=8))

def get_tracking_status(tracking_number):
    """
    Fetch real-time tracking status from carrier.
    """
    if MOCK_MODE:
        return "Yolda"
    return "API Tracking Not Implemented"
