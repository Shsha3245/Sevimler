from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models, schemas, database, auth

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=schemas.OrderSchema)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Start Transaction (Atomic Check)
    total_price = 0
    total_weight = 0
    order_items = []
    
    # Check products, calculate total and weight
    for item in order_data.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

        # Atomic check and update using with_for_update for locking row
        product = db.query(models.Product).filter(models.Product.id == item.product_id).with_for_update().first()
        if not product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
        
        if product.stock < item.quantity:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        
        # Calculate weight
        item_weight = product.weight * item.quantity
        total_weight += item_weight
        
        # Reduce stock
        product.stock -= item.quantity
        
        # Calculate item price
        item_total = product.price * item.quantity
        total_price += item_total
        
        order_items.append(models.OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price_at_time=product.price
        ))

    # Weight Validation (Production Rule: 1KG - 100KG)
    if total_weight < 1.0:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Minimum sipariş ağırlığı 1 KG'dır. Mevcut: {total_weight:.2f} KG")
    if total_weight > 100.0:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Maksimum sipariş ağırlığı 100 KG'dır. Mevcut: {total_weight:.2f} KG")

    # Create Order
    db_order = models.Order(
        user_id=current_user.id,
        total_price=total_price,
        status="pending",
        full_name=order_data.full_name,
        address=order_data.address,
        phone=order_data.phone,
        items=order_items
    )
    
    db.add(db_order)
    try:
        db.commit()
        db.refresh(db_order)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not finalize order in database")
    
    return db_order

@router.get("/my", response_model=List[schemas.OrderSchema])
def get_my_orders(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Order).filter(models.Order.user_id == current_user.id).order_by(models.Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=schemas.OrderSchema)
def get_order(order_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Basic security check: only owner or admin can see
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return order
