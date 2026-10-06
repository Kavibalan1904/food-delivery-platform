"""
Unit & Integration Tests for SwiftBite Food Delivery API.
Uses FastAPI TestClient to test health, restaurants, auth, and orders.
"""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="module")
def client():
    """Module-level client ensuring FastAPI lifespan (connect_db & seed_data) runs."""
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    """Verify health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "bite-api"
    assert data["version"] == "1.0.0"


def test_get_restaurants(client):
    """Verify fetching restaurants list."""
    response = client.get("/api/restaurants")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    restaurant = data[0]
    assert "name" in restaurant
    assert "cuisines" in restaurant
    assert "rating" in restaurant


def test_get_restaurant_by_id(client):
    """Verify fetching a specific restaurant and its menu items."""
    response = client.get("/api/restaurants/rest_001")
    assert response.status_code == 200
    data = response.json()
    assert data["_id"] == "rest_001"
    assert data["name"] == "Dindigul Thalappakatti"

    # Verify menu endpoint
    menu_res = client.get("/api/restaurants/rest_001/menu")
    assert menu_res.status_code == 200
    menu = menu_res.json()
    assert isinstance(menu, list)
    assert len(menu) > 0


def test_get_categories(client):
    """Verify categories endpoint."""
    response = client.get("/api/restaurants/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_auth_and_order_flow(client):
    """Verify user registration, login, and order placement flow."""
    import uuid
    random_user = f"test_{uuid.uuid4().hex[:6]}@example.com"

    # 1. Register
    reg_response = client.post(
        "/api/auth/register",
        json={
            "name": "Local Tester",
            "email": random_user,
            "password": "Password123!",
            "phone": "9876543210"
        }
    )
    assert reg_response.status_code in [200, 201]
    reg_data = reg_response.json()
    assert "token" in reg_data
    token = reg_data["token"]

    # 2. Login
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": random_user,
            "password": "Password123!"
        }
    )
    assert login_response.status_code == 200
    assert "token" in login_response.json()

    # 3. Verify /me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == random_user
    assert me_data["name"] == "Local Tester"

    # 4. Create Order
    order_payload = {
        "restaurant_id": "rest_001",
        "restaurant_name": "Dindigul Thalappakatti",
        "items": [
            {
                "item_id": "item_001",
                "name": "Thalappakatti Mutton Biryani",
                "price": 399,
                "quantity": 2
            }
        ],
        "delivery_address": "45 Anna Salai, Chennai",
        "total_amount": 798.0,
        "payment_method": "card"
    }
    order_res = client.post("/api/orders", json=order_payload, headers=headers)
    assert order_res.status_code in [200, 201]
    order_data = order_res.json()
    assert "order_id" in order_data or "_id" in order_data
    order_id = order_data.get("order_id") or order_data.get("_id")

    # 5. List Orders
    list_res = client.get("/api/orders", headers=headers)
    assert list_res.status_code == 200
    orders_list = list_res.json()
    assert isinstance(orders_list, list)
    assert len(orders_list) > 0
    assert any(o.get("_id") == order_id or o.get("order_id") == order_id for o in orders_list)

    # 6. Update order status
    patch_res = client.patch(f"/api/orders/{order_id}/status", json={"status": "preparing"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "preparing"

    # 7. Get order detail
    get_res = client.get(f"/api/orders/{order_id}")
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "preparing"
    assert "driver" in get_res.json()


def test_restaurant_search_and_sort(client):
    """Verify restaurant search and sorting capabilities."""
    # Search by name
    res = client.get("/api/restaurants?search=Pizza")
    assert res.status_code == 200
    data = res.json()
    assert any("Pizza" in r["name"] for r in data)

    # Sort by rating
    sort_res = client.get("/api/restaurants?sort_by=rating")
    assert sort_res.status_code == 200
    ratings = [r["rating"] for r in sort_res.json()]
    assert ratings == sorted(ratings, reverse=True)


def test_prometheus_metrics(client):
    """Verify Prometheus metrics endpoint and metric collection."""
    # 1. Scrape standard /metrics endpoint
    res = client.get("/metrics")
    assert res.status_code == 200
    assert "text/plain" in res.headers.get("content-type", "")
    content = res.text

    # Verify standard metrics and custom domain metrics exist in scrape output
    assert "http_requests_total" in content
    assert "http_request_duration_seconds" in content
    assert "bite_orders_total" in content
    assert "bite_order_revenue_total" in content
    assert "bite_active_orders" in content
    assert "bite_user_actions_total" in content

    # 2. Scrape alias /api/metrics endpoint
    alias_res = client.get("/api/metrics")
    assert alias_res.status_code == 200
    assert "http_requests_total" in alias_res.text


