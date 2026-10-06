"""
Authentication routes - Register & Login
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import jwt, JWTError

from app.database import get_db
from app.metrics import USER_ACTIONS_TOTAL

router = APIRouter()


def hash_password(password: str) -> str:
    """Hash password securely using bcrypt."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


DEFAULT_JWT_SECRET = "swiftbite-secret-key-12345"


def create_token(user_id: str) -> str:
    """Create JWT token."""
    secret = os.getenv("JWT_SECRET", DEFAULT_JWT_SECRET)
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    hours = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=hours),
    }
    return jwt.encode(payload, secret, algorithm=algorithm)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    """Register a new user."""
    db = get_db()

    # Check if email already exists
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    user_doc = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "phone": data.phone,
        "created_at": datetime.now(timezone.utc),
        "addresses": [],
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_token(user_id)

    try:
        USER_ACTIONS_TOTAL.labels(action="register").inc()
    except Exception:
        pass

    return {
        "message": "User registered successfully",
        "user_id": user_id,
        "token": token,
        "user": {
            "id": user_id,
            "name": data.name,
            "email": data.email,
            "phone": data.phone,
        }
    }


@router.post("/login")
async def login(data: LoginRequest):
    """Login user and return JWT token."""
    db = get_db()

    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_token(str(user["_id"]))

    try:
        USER_ACTIONS_TOTAL.labels(action="login").inc()
    except Exception:
        pass

    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "phone": user.get("phone", ""),
        },
    }


def get_user_id_from_token(token: str) -> Optional[str]:
    """Extract user_id from JWT token safely."""
    secret = os.getenv("JWT_SECRET", DEFAULT_JWT_SECRET)
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        return payload.get("sub")
    except JWTError:
        return None


@router.get("/me")
async def get_current_user_profile(authorization: Optional[str] = Header(None)):
    """Get the currently logged-in user's profile from JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token",
        )

    token = authorization.split(" ")[1]
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    db = get_db()
    user = None
    try:
        from bson import ObjectId
        if ObjectId.is_valid(user_id):
            user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass

    if not user:
        user = await db.users.find_one({"_id": user_id})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "addresses": user.get("addresses", []),
    }

