from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

# Strict Category List
ALLOWED_CATEGORIES = ["Kuruyemiş", "Kuru Meyve"]

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    stock = Column(Integer)
    weight = Column(Float, default=1.0)
    image_url = Column(String)
    category = Column(String, default="Kuruyemiş")

class Story(Base):
    __tablename__ = "stories"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    total_price = Column(Float)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Müşteri Bilgileri
    full_name = Column(String)
    address = Column(String)
    phone = Column(String)

    payment_id = Column(String, nullable=True)
    tracking_number = Column(String, nullable=True)

    # Sipariş kalemleri ile ilişki
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price_at_time = Column(Float)

    # İlişkiler
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

    # --- DOĞRU YER BURASI: Ürün bilgilerini çekmek için ---
    @property
    def product_name(self):
        return self.product.name if self.product else "İsimsiz Ürün"

    @property
    def product_image(self):
        return self.product.image_url if self.product else None
