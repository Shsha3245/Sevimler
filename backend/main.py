import logging
import time
import os
from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pathlib import Path

import models, schemas, database, auth
from routes import products, stories, orders, admin, payment

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
ASSETS_DIR = BASE_DIR / "assets"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger("api")

# DB INIT
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# ---------------- CORS (CRITICAL FIX) ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sevimlerkuruyemis.com",
        "https://www.sevimlerkuruyemis.com",
        "https://api.sevimlerkuruyemis.com",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- LOGGING ----------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    logger.info(f"{request.method} {request.url.path} {response.status_code} {time.time()-start:.2f}s")
    return response

# ---------------- GLOBAL ERROR ----------------
@app.exception_handler(Exception)
async def global_error(request: Request, exc: Exception):
    logger.error(str(exc), exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "server error"})

# ---------------- STATIC ----------------
app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# ---------------- ROUTES ----------------
app.include_router(products.router)
app.include_router(stories.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(payment.router)

@app.get("/")
def health():
    return {"ok": True}

# ---------------- AUTH ----------------
@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(400, "user exists")

    db_user = models.User(
        username=user.username,
        hashed_password=auth.get_password_hash(user.password),
        is_admin=False
    )

    db.add(db_user)
    db.commit()
    return db_user


@app.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()

    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(401, "invalid")

    return {
        "access_token": auth.create_access_token({"sub": db_user.username}),
        "token_type": "bearer"
    }


@app.get("/me")
def me(user=Depends(auth.get_current_user)):
    return user
