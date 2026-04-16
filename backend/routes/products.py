from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from .. import models, schemas, database, auth

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[schemas.Product])
def get_products(db: Session = Depends(database.get_db)):
    # Production Safety: Filter by allowed categories at query level
    return db.query(models.Product).filter(
        models.Product.category.in_(models.ALLOWED_CATEGORIES)
    ).all()

@router.post("/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    # Schema validation handles this, but secondary check for DB safety
    if product.category not in models.ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Allowed: {models.ALLOWED_CATEGORIES}")
        
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}
