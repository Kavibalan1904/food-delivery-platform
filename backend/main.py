"""
Bite Food Delivery Platform - Backend API
FastAPI + MongoDB (Motor async driver)
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import connect_db, close_db, seed_data
from app.routes import auth, restaurants, orders

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await connect_db()
    await seed_data()
    yield
    await close_db()


app = FastAPI(
    title="Bite API",
    description="Bite Food Delivery Platform Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(restaurants.router, prefix="/api/restaurants", tags=["Restaurants"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "bite-api", "version": "1.0.0"}
