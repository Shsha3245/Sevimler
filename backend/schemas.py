from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional
from datetime import datetime

# Import allowed categories for validation
ALLOWED_CATEGORIES = ["Kuruyemiş", "Kuru Meyve"]

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    weight: float = 1.0
    image_url: str
    category: str

    @field_validator('category')
    @classmethod
    def validate_category(cls, v: str) -> str:
        # Normalize: strip and title case (careful with Turkish characters though)
        normalized = v.strip().title()
        # Custom fix for Turkish title case if needed, but "Kuruyemiş" and "Kuru Meyve" are standard
        if normalized not in ALLOWED_CATEGORIES:
            # Fallback check for case-insensitive match
            if v.lower() == "kuruyemiş": normalized = "Kuruyemiş"
            elif v.lower() == "kuru meyve" or v.lower() == "kurumeyve": normalized = "Kuru Meyve"
            else:
                raise ValueError(f"Invalid category. Allowed: {', '.join(ALLOWED_CATEGORIES)}")
        return normalized

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class StoryBase(BaseModel):
    image_url: str
    title: Optional[str] = None

class StoryCreate(StoryBase):
    pass

class Story(StoryBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    full_name: str
    address: str
    phone: str

class OrderItemSchema(BaseModel):
    product_id: int
    quantity: int
    price_at_time: float
    name: Optional[str] = None

class OrderSchema(BaseModel):
    id: int
    total_price: float
    status: str
    created_at: datetime
    full_name: str
    address: str
    phone: str
    items: List[OrderItemSchema]
    payment_id: Optional[str] = None
    tracking_number: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_sales: float
    total_orders: int
    daily_sales: float
    weekly_sales: float
    monthly_sales: float
