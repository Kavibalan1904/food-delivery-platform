"""
SwiftBite Food Delivery Platform - Backend API
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
    title="SwiftBite API",
    description="Food Delivery Platform Backend API",
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

# Prometheus metrics tracking (Pure Python, no extra dependencies)
import time
from fastapi.responses import PlainTextResponse

START_TIME = time.time()
REQUEST_COUNT = 0


@app.middleware("http")
async def count_requests(request, call_next):
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    return await call_next(request)


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(restaurants.router, prefix="/api/restaurants", tags=["Restaurants"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "swiftbite-api", "version": "1.0.0"}


@app.get("/metrics", response_class=PlainTextResponse)
async def get_metrics():
    """Prometheus metrics endpoint."""
    uptime = int(time.time() - START_TIME)
    return (
        f"# HELP app_uptime_seconds Application uptime in seconds\n"
        f"# TYPE app_uptime_seconds counter\n"
        f"app_uptime_seconds {uptime}\n\n"
        f"# HELP http_requests_total Total number of HTTP requests\n"
        f"# TYPE http_requests_total counter\n"
        f"http_requests_total {REQUEST_COUNT}\n\n"
        f"# HELP app_status Application health status (1 = healthy)\n"
        f"# TYPE app_status gauge\n"
        f"app_status 1\n"
    )

