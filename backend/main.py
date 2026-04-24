import logging
import time
from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import models, schemas, database, auth
from routes import products, stories, orders, admin, payment
import os
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pathlib import Path
load_dotenv()


BASE_DIR = Path(__file__).resolve().parent
ASSETS_DIR = BASE_DIR / "assets"
# Configure Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("sevimler_api")

# Initialize Database
try:
    models.Base.metadata.create_all(bind=database.engine)
    logger.info("Database initialized successfully.")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")

app = FastAPI(title="Sevimler Kuruyemiş API")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": "Client Error", "detail": exc.detail, "code": "CLIENT_ERROR"}
        )
    
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred on the server.",
            "code": "INTERNAL_SERVER_ERROR"
        }
    )

# Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"Method: {request.method} Path: {request.url.path} Status: {response.status_code} Duration: {duration:.2f}s")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sevimlerkuruyemis.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files Serving
app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# Include Routers
app.include_router(products.router)
app.include_router(stories.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(payment.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Sevimler Kuruyemiş API is running"}


# Auth Endpoints
@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password, is_admin=False)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token = auth.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
    
@app.get("/debug-version")
def debug():
    return {"version": "ASSETS_FIX_1"}
# Seed Admin Account if not exists
@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    admin_user = db.query(models.User).filter(models.User.username == admin_username).first()
    if not admin_user:
        hashed_pw = auth.get_password_hash(admin_password)
        new_admin = models.User(username=admin_username, hashed_password=hashed_pw, is_admin=True)
        db.add(new_admin)
        db.commit()
    # Seed Products if not exists
    sample_products = [
        {"name": "Antep Fıstığı", "description": "Gaziantep'ten taze, tam kavrulmuş.", "price": 450.0, "stock": 100, "image_url": "/assets/fistik.jpeg", "category": "Kuruyemiş"},
        {"name": "Çiğ Badem", "description": "Taze ve besleyici datça bademi.", "price": 380.0, "stock": 50, "image_url": "/assets/badem.jpeg", "category": "Kuruyemiş"},
        {"name": "Ceviz İçi", "description": "Yerli ve iri taneli ceviz içi.", "price": 320.0, "stock": 75, "image_url": "/assets/ceviz.jpeg", "category": "Kuruyemiş"},
        {"name": "Kuru Üzüm", "description": "Doğal kurutulmuş çekirdeksiz üzüm.", "price": 120.0, "stock": 200, "image_url": "/assets/uzum.jpeg", "category": "Kuru Meyve"}
    ]
    
    for p in sample_products:
        if not db.query(models.Product).filter(models.Product.name == p["name"]).first():
            db.add(models.Product(**p))
            
    # Seed Stories if not exists
    sample_stories = [
        {"title": "Taze Hasat", "image_url": "/assets/story1.jpeg"},
        {"title": "Geleneksel", "image_url": "/assets/story2.jpeg"},
        {"title": "Doğallık", "image_url": "/assets/story3.jpeg"}
    ]
    
    for s in sample_stories:
        if not db.query(models.Story).filter(models.Story.title == s["title"]).first():
            db.add(models.Story(**s))

    db.commit()
    db.close()

if __name__ == "__main__":
    import uvicorn
    
