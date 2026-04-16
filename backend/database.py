import os
import time
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

# PostgreSQL Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sevimler.db")

def create_engine_with_retry(url, max_retries=5, retry_delay=2):
    retries = 0
    while retries < max_retries:
        try:
            # Use pooling for production safely
            if "sqlite" in url:
                engine = create_engine(url, connect_args={"check_same_thread": False})
            else:
                engine = create_engine(
                    url, 
                    pool_size=20, 
                    max_overflow=10, 
                    pool_timeout=30, 
                    pool_recycle=1800,
                    pool_pre_ping=True
                )
            # Test connection
            engine.connect()
            return engine
        except OperationalError as e:
            retries += 1
            logging.error(f"Database connection failed (Attempt {retries}/{max_retries}): {e}")
            if retries == max_retries:
                raise
            time.sleep(retry_delay)

engine = create_engine_with_retry(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
