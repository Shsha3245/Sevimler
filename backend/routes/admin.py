from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
import shutil
import os
import uuid
import models, schemas, database, auth

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    # Total
    total_sales = db.query(func.sum(models.Order.total_price)).scalar() or 0
    total_orders = db.query(models.Order).count()
    
    # Daily
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    daily_sales = db.query(func.sum(models.Order.total_price)).filter(models.Order.created_at >= today).scalar() or 0
    
    # Weekly
    week_ago = today - timedelta(days=7)
    weekly_sales = db.query(func.sum(models.Order.total_price)).filter(models.Order.created_at >= week_ago).scalar() or 0
    
    # Monthly
    month_ago = today - timedelta(days=30)
    monthly_sales = db.query(func.sum(models.Order.total_price)).filter(models.Order.created_at >= month_ago).scalar() or 0
    
    return {
        "total_sales": total_sales,
        "total_orders": total_orders,
        "daily_sales": daily_sales,
        "weekly_sales": weekly_sales,
        "monthly_sales": monthly_sales
    }

@router.get("/orders", response_model=List[schemas.OrderSchema])
def get_all_orders(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()

@router.patch("/orders/{order_id}/status")
def update_order_status(order_id: int, status_data: dict, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    new_status = status_data.get("status")
    if new_status not in ["pending", "paid", "preparing", "shipped", "delivered", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    order.status = new_status
    db.commit()
    return {"message": "Order status updated", "new_status": new_status}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_admin_user)):
    # Simple check for extension
    ext = file.filename.split(".")[-1]
    if ext.lower() not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join("assets", filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # URL for frontend to use
    return {"url": f"/assets/{filename}"}

@router.post("/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    # Category normalization happens in schema level but double check here
    if product.category not in models.ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")
        
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.post("/stories", response_model=schemas.Story)
def create_story(story: schemas.StoryCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_story = models.Story(**story.dict())
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story
