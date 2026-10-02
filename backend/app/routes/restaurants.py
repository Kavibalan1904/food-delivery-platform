"""
Restaurant and Menu routes.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query

from app.database import get_db

router = APIRouter()


@router.get("")
async def list_restaurants(
    cuisine: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
):
    """List all restaurants, optionally filtered by cuisine or search query and sorted."""
    db = get_db()

    query = {"is_open": True}
    if cuisine and cuisine.lower() != "all":
        query["cuisines"] = {"$regex": cuisine, "$options": "i"}

    if search and search.strip():
        term = search.strip()
        matching_dishes = await db.menu_items.find({
            "$or": [
                {"name": {"$regex": term, "$options": "i"}},
                {"description": {"$regex": term, "$options": "i"}},
            ]
        }).to_list(length=200)
        matching_rest_ids = list({d["restaurant_id"] for d in matching_dishes if "restaurant_id" in d})

        or_conditions = [
            {"name": {"$regex": term, "$options": "i"}},
            {"cuisines": {"$regex": term, "$options": "i"}},
            {"address": {"$regex": term, "$options": "i"}},
        ]
        if matching_rest_ids:
            or_conditions.append({"_id": {"$in": matching_rest_ids}})
        query["$or"] = or_conditions

    restaurants = await db.restaurants.find(query).to_list(length=100)

    # Sorting
    if sort_by == "rating":
        restaurants.sort(key=lambda r: r.get("rating", 0), reverse=True)
    elif sort_by == "delivery_time":
        restaurants.sort(key=lambda r: r.get("delivery_time", 999))
    elif sort_by == "cost_low":
        restaurants.sort(key=lambda r: r.get("price_for_two", 999))
    elif sort_by == "cost_high":
        restaurants.sort(key=lambda r: r.get("price_for_two", 0), reverse=True)

    return restaurants


@router.get("/categories")
async def get_categories():
    """Get list of popular cuisines / food categories."""
    db = get_db()
    restaurants = await db.restaurants.find({}).to_list(length=100)
    categories = set()
    for r in restaurants:
        for c in r.get("cuisines", []):
            categories.add(c)
    return sorted(list(categories))


@router.get("/dishes/trending")
async def get_trending_dishes(limit: int = 12):
    """Get trending and bestseller dishes across Chennai restaurants."""
    db = get_db()
    items = await db.menu_items.find({"is_bestseller": True}).to_list(length=limit)
    restaurants = await db.restaurants.find({}).to_list(length=100)
    rest_map = {r["_id"]: r for r in restaurants}
    for item in items:
        rest = rest_map.get(item.get("restaurant_id"))
        if rest:
            item["restaurant_name"] = rest.get("name")
            item["restaurant_address"] = rest.get("address")
    return items


@router.get("/{restaurant_id}")
async def get_restaurant(restaurant_id: str):
    """Get a single restaurant by ID."""
    db = get_db()

    restaurant = await db.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )
    return restaurant


@router.get("/{restaurant_id}/menu")
async def get_menu(restaurant_id: str):
    """Get menu items for a restaurant."""
    db = get_db()

    # Verify restaurant exists
    restaurant = await db.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )

    items = await db.menu_items.find({"restaurant_id": restaurant_id}).to_list(length=100)
    return items
