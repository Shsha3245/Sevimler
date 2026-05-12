from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
import models, schemas, database, auth

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
# current_user bağımlılığını (Depends) buradan kaldırdık
def delete_product(product_id: int, db: Session = Depends(database.get_db)):
    try:
        # 1. Ürünü veritabanında bul
        db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
        
        if not db_product:
            raise HTTPException(status_code=404, detail="Ürün bulunamadı")

        # 2. Ürünü sil
        db.delete(db_product)
        db.commit()
        
        return {"message": "Ürün başarıyla silindi"}
        
    except Exception as e:
        db.rollback() # Bir hata olursa işlemi geri al
        print(f"Silme hatası: {str(e)}") # Loglara bakabilmen için
        raise HTTPException(status_code=500, detail="Sunucu taraflı bir hata oluştu")

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int, 
    product_update: schemas.ProductCreate, # Mevcut şemanı kullanabilirsin
    db: Session = Depends(database.get_db),
    # current_user: models.User = Depends(auth.get_current_admin_user) # Güvenlik için sonra açabilirsin
):
    """
    Ürün bilgilerini (isim, fiyat, resim, kategori) günceller.
    """
    try:
        # 1. Ürünü bul
        db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
        
        if not db_product:
            raise HTTPException(status_code=404, detail="Güncellenecek ürün bulunamadı")

        # 2. Gelen verileri veritabanı nesnesine aktar
        update_data = product_update.dict()
        
        # Kategori kontrolü (DB güvenliği için)
        if update_data['category'] not in models.ALLOWED_CATEGORIES:
             raise HTTPException(status_code=400, detail="Geçersiz kategori")

        for key, value in update_data.items():
            setattr(db_product, key, value)

        # 3. Kaydet ve Yenile
        db.commit()
        db.refresh(db_product)
        
        return db_product

    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        print(f"Güncelleme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail="Güncelleme sırasında bir hata oluştu")
