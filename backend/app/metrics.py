"""
Prometheus Metrics & Observability for Bite Food Delivery Platform.
Provides Prometheus middleware for tracking HTTP request count, latency,
and error status codes, alongside custom domain metrics for orders, revenue,
and user activity.
"""

import re
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

# ==============================================================================
# 1. Standard HTTP Performance Metrics
# ==============================================================================

HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total HTTP requests received by endpoint, HTTP method, and status code",
    ["method", "endpoint", "status_code"],
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds by endpoint and HTTP method",
    ["method", "endpoint"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 10.0),
)

HTTP_REQUESTS_IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "Current number of HTTP requests being processed concurrently",
    ["method", "endpoint"],
)

# ==============================================================================
# 2. Bite Domain & Business Metrics
# ==============================================================================

ORDERS_TOTAL = Counter(
    "bite_orders_total",
    "Total food orders created or transitioned by status",
    ["status"],
)

ORDER_REVENUE_TOTAL = Counter(
    "bite_order_revenue_total",
    "Cumulative revenue from placed food orders in INR",
)

ACTIVE_ORDERS_GAUGE = Gauge(
    "bite_active_orders",
    "Current number of active / in-progress customer orders",
)

USER_ACTIONS_TOTAL = Counter(
    "bite_user_actions_total",
    "Total user authentication events",
    ["action"],  # 'login' or 'register'
)


def normalize_path(path: str) -> str:
    """
    Groups dynamic path parameters into normalized templates
    to prevent high-cardinality label explosion in Prometheus.
    E.g.:
      /api/restaurants/rest_001      -> /api/restaurants/{id}
      /api/restaurants/rest_001/menu -> /api/restaurants/{id}/menu
      /api/orders/66a12b.../status   -> /api/orders/{id}/status
    """
    clean = re.sub(r"/api/restaurants/[^/]+(/menu)?", r"/api/restaurants/{id}\1", path)
    clean = re.sub(r"/api/orders/[^/]+(/status)?", r"/api/orders/{id}\1", clean)
    return clean


class PrometheusMiddleware(BaseHTTPMiddleware):
    """Starlette/FastAPI middleware tracking request rate, duration, and status codes."""

    async def dispatch(self, request: Request, call_next):
        # Exclude /metrics endpoint itself to prevent scrape pollution
        if request.url.path == "/metrics":
            return await call_next(request)

        method = request.method
        endpoint = normalize_path(request.url.path)

        HTTP_REQUESTS_IN_PROGRESS.labels(method=method, endpoint=endpoint).inc()
        start_time = time.perf_counter()

        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        except Exception:
            status_code = 500
            raise
        finally:
            duration = time.perf_counter() - start_time
            HTTP_REQUESTS_IN_PROGRESS.labels(method=method, endpoint=endpoint).dec()
            HTTP_REQUESTS_TOTAL.labels(
                method=method, endpoint=endpoint, status_code=str(status_code)
            ).inc()
            HTTP_REQUEST_DURATION_SECONDS.labels(
                method=method, endpoint=endpoint
            ).observe(duration)


def get_metrics_response() -> Response:
    """Generate Prometheus scrape format response."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
