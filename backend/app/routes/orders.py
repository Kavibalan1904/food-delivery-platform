"""
Order routes.
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel

from app.database import get_db
from app.routes.auth import get_user_id_from_token

router = APIRouter()


class OrderItem(BaseModel):
    item_id: str
    name: str
    price: float
    quantity: int


class CreateOrderRequest(BaseModel):
    restaurant_id: str
    restaurant_name: Optional[str] = None
    items: List[OrderItem]
    delivery_address: str
    payment_method: str = "online"
    total_amount: Optional[float] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = None


class UpdateOrderStatusRequest(BaseModel):
    status: str


def get_driver_info():
    return {
        "name": "Murugan Selvam",
        "phone": "+91 98401 23456",
        "rating": 4.88,
        "vehicle": "Ather 450X EV (TN-07-EV-2024)",
        "photo": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(
    data: CreateOrderRequest,
    authorization: Optional[str] = Header(None)
):
    """Place a new order."""
    db = get_db()

    # Calculate total
    total = data.total_amount if data.total_amount is not None else sum(item.price * item.quantity for item in data.items)

    # Determine restaurant name if missing
    restaurant_name = data.restaurant_name
    if not restaurant_name:
        rest = await db.restaurants.find_one({"_id": data.restaurant_id})
        restaurant_name = rest["name"] if rest else "SwiftBite Partner"

    # User identification from JWT or request
    user_id = data.user_id
    user_name = data.user_name
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        extracted_uid = get_user_id_from_token(token)
        if extracted_uid:
            user_id = extracted_uid
            # Try to fetch user name
            user = await db.users.find_one({"_id": user_id})
            if user:
                user_name = user.get("name", user_name)

    order_doc = {
        "restaurant_id": data.restaurant_id,
        "restaurant_name": restaurant_name,
        "items": [item.model_dump() for item in data.items],
        "total": round(total, 2),
        "total_amount": round(total, 2),
        "delivery_address": data.delivery_address,
        "payment_method": data.payment_method,
        "status": "placed",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "estimated_delivery": 30,  # minutes
        "user_id": user_id,
        "user_name": user_name or "Guest Gourmet",
        "driver": get_driver_info(),
    }

    result = await db.orders.insert_one(order_doc)
    order_id = str(result.inserted_id)

    return {
        "message": "Order placed successfully!",
        "order_id": order_id,
        "_id": order_id,
        "total": round(total, 2),
        "estimated_delivery": 30,
        "status": "placed",
    }


@router.get("")
async def list_orders(
    authorization: Optional[str] = Header(None),
    user_id: Optional[str] = None
):
    """Get orders, optionally filtered by user."""
    db = get_db()

    current_uid = user_id
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        extracted = get_user_id_from_token(token)
        if extracted:
            current_uid = extracted

    query = {}
    if current_uid:
        query["$or"] = [{"user_id": current_uid}, {"user_id": None}]

    orders = await db.orders.find(query).to_list(length=100)

    # Convert _id to string and sort descending by creation
    for o in orders:
        o["_id"] = str(o["_id"])
        if "order_id" not in o:
            o["order_id"] = o["_id"]

    orders.reverse()
    return orders


@router.get("/{order_id}")
async def get_order(order_id: str):
    """Get order details by ID."""
    db = get_db()

    order = None
    try:
        from bson import ObjectId
        if ObjectId.is_valid(order_id):
            order = await db.orders.find_one({"_id": ObjectId(order_id)})
    except Exception:
        pass

    if not order:
        order = await db.orders.find_one({"_id": order_id})

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order["_id"] = str(order["_id"])
    order["order_id"] = order["_id"]
    if "driver" not in order:
        order["driver"] = get_driver_info()
    return order


@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, data: UpdateOrderStatusRequest):
    """Update order status (e.g. placed -> confirmed -> preparing -> out_for_delivery -> delivered)."""
    valid_statuses = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
    if data.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Choose from: {', '.join(valid_statuses)}",
        )

    db = get_db()
    query = {"_id": order_id}
    try:
        from bson import ObjectId
        if ObjectId.is_valid(order_id):
            query = {"$or": [{"_id": ObjectId(order_id)}, {"_id": order_id}]}
    except Exception:
        pass

    result = await db.orders.update_one(query, {"$set": {"status": data.status}})
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return {
        "message": f"Order status updated to {data.status}",
        "order_id": order_id,
        "status": data.status,
    }

