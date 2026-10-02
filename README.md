# 🍕 SwiftBite Chennai — Food Delivery Platform

A full-stack, responsive Chennai-based food delivery platform built with **FastAPI (Python)** and **React + Vite**. Features vibrant modern design aesthetics, real-time live order tracking, category & dietary filters, interactive shopping cart, secure authentication with JWT, and MongoDB integration with seamless in-memory fallback. Featuring Chennai culinary legends including *Dindigul Thalappakatti*, *Murugan Idli Shop*, *Anjappar Chettinad*, *Tuscana Pizza*, and *Madras Coffee House*.

---

## 🌟 Key Features

### 🛒 Customer Experience
- **Interactive Restaurant Discovery**: Filter dining spots by cuisine categories (*Biryani, Pizza, Burger, Chinese, South Indian, Desserts*) or sort by *Rating 4.0+*, *Fast Delivery*, and *Cost*.
- **Real-Time Live Search**: Instant restaurant & dish filtering directly from the top navigation search bar or the hero section.
- **Dietary & Menu Filtering**: Toggle *Pure Veg 🌱* vs *Non-Veg 🍗*, filter by *Bestsellers*, and search dishes within individual restaurant menus.
- **Dynamic Shopping Cart**: Slide-out cart drawer with real-time quantity modifiers (`+` / `-`), total calculation, customizable delivery address, and instant order placement.
- **Live Order Tracking**: Visual 5-stage order progress stepper (*Placed → Confirmed → Preparing → Out for Delivery → Delivered*) with an animated delivery route visualizer, driver contact card, and live simulation controls.
- **Order History**: Access past orders with itemized breakdowns and one-click re-ordering.
- **JWT Authentication**: Register and login with secure bcrypt password hashing and token persistence.

### ⚙️ Backend Architecture
- **FastAPI**: Async endpoints with automatic OpenAPI documentation.
- **Database Layer**: Motor async MongoDB driver with an automatic, zero-configuration in-memory collection fallback for local development without MongoDB.
- **Lifecycle Management**: Seed data automatically injected on startup for restaurants and menus.
- **Robust Test Suite**: Comprehensive pytest integration tests verifying auth, restaurant search, menu retrieval, order lifecycle, and status updates.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM 6, React Icons, Axios, Vanilla CSS Design System |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic v2, Python-Jose (JWT), Passlib / Bcrypt |
| **Database** | MongoDB (Motor Async Driver) with InMemoryCollection fallback |
| **Testing** | Pytest, FastAPI TestClient, Browser Subagent Verification |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run backend test suite
python -m pytest

# Start backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install npm dependencies (if not already installed)
npm install

# Start Vite dev server
npm run dev
```
Web application will be accessible at: `http://localhost:3000/`

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Login and receive JWT access token
- `GET /api/auth/me` — Retrieve logged-in user profile (Bearer token)

### Restaurants & Menus
- `GET /api/restaurants` — List restaurants (supports `cuisine`, `search`, `sort_by`)
- `GET /api/restaurants/categories` — Get unique food categories
- `GET /api/restaurants/{id}` — Get restaurant details
- `GET /api/restaurants/{id}/menu` — Get restaurant menu items

### Orders & Tracking
- `POST /api/orders` — Place a new food order
- `GET /api/orders` — List past orders (filtered by user if authenticated)
- `GET /api/orders/{id}` — Get order status, delivery driver, and timeline
- `PATCH /api/orders/{id}/status` — Update order status (simulation / driver updates)

---

## 🧪 Running Tests
```bash
# Run backend pytest suite
cd backend
python -m pytest

# Build frontend production bundle
cd ../frontend
npm run build
```
