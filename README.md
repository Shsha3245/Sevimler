# Sevimler Kuruyemiş E-Commerce Platform

A production-ready, premium e-commerce web application for a Turkish nuts brand.

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS (Glassmorphism), Framer Motion, Lucide Icons, Axios.
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite (PostgreSQL-ready).
- **Authentication**: JWT (JSON Web Tokens) with secure storage and interceptors.

## Admin Panel (Sevimler Panel)
**Hidden URL**: `/sevimler-panel-2026-secure`

**Hardcoded Credentials**:
- **Username**: `2026Sevimler`
- **Password**: `2026SevimlerKuruyemiş2026`

## Features
- **Premium UI**: Dark mode with gold accents and Apple-level aesthetics.
- **Story System**: Instagram-style horizontal scroll with full-screen viewer.
- **Shopping Cart**: Real-time state management, persistent across sessions.
- **Atomic Stock**: Prevents overselling using database-level row locking.
- **Admin Dashboard**: Real-time sales analytics (Daily, Weekly, Monthly) and inventory management.
- **Secure API**: Backend-enforced role validation for all sensitive operations.

## Setup Instructions

### Backend
1. `cd backend`
2. `pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart`
3. `python main.py` OR `uvicorn main:app --reload`
- The API will be available at `http://localhost:8000`.
- SQLite database `sevimler.db` will be created automatically.
- Assets are served from `backend/assets/`.

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
- The app will be available at `http://localhost:5173`.

## Security & Reliability
- Prices are validated on the backend to prevent frontend manipulation.
- JWT tokens are automatically attached to requests via Axios interceptors.
- Stock reduction happens within a database transaction.
