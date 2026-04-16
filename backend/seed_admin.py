from backend.database import SessionLocal
from backend import models
from backend.auth import get_password_hash

db = SessionLocal()

admin_user = models.User(
    username="Sevimler2026",
    hashed_password=get_password_hash("2026SevimlerKuruyemis2026"),
    is_admin=True
)

db.add(admin_user)
db.commit()
db.close()
