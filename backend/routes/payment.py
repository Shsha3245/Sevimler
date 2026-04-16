from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .. import models, database, auth
from ..payment import paytr
from ..shipping import service as shipping_service
import logging

router = APIRouter(prefix="/payment", tags=["payment"])

@router.post("/create")
async def create_payment(order_id_data: dict, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    order_id = order_id_data.get("order_id")
    if not order_id:
        raise HTTPException(status_code=400, detail="order_id is required")

    # Fetch order and validate
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to pay for this order")

    # Use modular PayTR handler
    user_ip = "127.0.0.1" # Standard fallback, could be extracted from request
    pay_data = paytr.create_payment_session(order, current_user.username + "@example.com", user_ip)
    
    return pay_data

@router.post("/callback")
async def payment_callback(request: Request, db: Session = Depends(database.get_db)):
    # Get Form Data
    form_data = await request.form()
    
    # Verify Callback
    if not paytr.verify_callback(form_data):
        logging.warning("PAYTR: Received invalid callback hash.")
        return "PAYTR FAIL: Hash mismatch"
    
    merchant_oid = form_data.get("merchant_oid")
    status = form_data.get("status")
    
    # Find Order
    order = db.query(models.Order).filter(models.Order.id == int(merchant_oid)).first()
    if not order:
        return "PAYTR REJECTED: Order not found"
        
    # Update Status
    if status == "success":
        order.status = "paid"
        db.commit()
        
        # Trigger Modular Shipping
        tracking_number = shipping_service.create_shipment(order)
        if tracking_number:
            order.tracking_number = tracking_number
            order.status = "shipped" # Auto-move to shipped if shipping triggered
            db.commit()
            
        return "OK"
    else:
        order.status = "failed"
        db.commit()
        return "OK"
