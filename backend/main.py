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

# ---------------- LOGGING ----------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("sevimler_api")

# ---------------- DB INIT ----------------
try:
    models.Base.metadata.create_all(bind=database.engine)
    logger.info("Database initialized successfully.")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")

app = FastAPI(title="Sevimler Kuruyemiş API")

# ---------------- GLOBAL EXCEPTION ----------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )

    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )

# ---------------- CORS FIX (PAYTR + FRONTEND) ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sevimlerkuruyemis.com",
        "https://www.sevimlerkuruyemis.com",
        "https://api.sevimlerkuruyemis.com",
        "https://www.paytr.com",
        "https://paytr.com",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- REQUEST LOG ----------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start

    logger.info(
        f"{request.method} {request.url.path} "
        f"{response.status_code} {duration:.2f}s"
    )
    return response

# ---------------- STATIC ----------------
app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# ---------------- ROUTERS ----------------
app.include_router(products.router)
app.include_router(stories.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(payment.router)

# ---------------- HEALTH ----------------
@app.get("/")
def health_check():
    return {"status": "ok", "message": "API running"}

# ---------------- REGISTER ----------------
@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):

    db_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = auth.get_password_hash(user.password)

    new_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        is_admin=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# ---------------- LOGIN ----------------
@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserCreate, db: Session = Depends(database.get_db)):

    db_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_access_token({"sub": db_user.username})

    return {"access_token": token, "token_type": "bearer"}

# ---------------- ME ----------------
@app.get("/me", response_model=schemas.User)
def me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ---------------- DEBUG ----------------
@app.get("/debug-version")
def debug():
    return {"version": "FINAL_STABLE"}

# ---------------- STARTUP SEED ----------------
@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()

    try:
        admin_username = os.getenv("ADMIN_USERNAME")
        admin_password = os.getenv("ADMIN_PASSWORD")

        if admin_username and admin_password:
            admin_user = db.query(models.User).filter(
                models.User.username == admin_username
            ).first()

            if not admin_user:
                hashed_pw = auth.get_password_hash(admin_password)

                db.add(models.User(
                    username=admin_username,
                    hashed_password=hashed_pw,
                    is_admin=True
                ))
                db.commit()

        db.commit()

    except Exception as e:
        logger.error(f"Startup error: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
