"""
Dashboard Routes

Provides analytics and metrics for the admin dashboard:
- Overview statistics
- Admin Overview (earnings, pending items, counts)
- Sales timeline
- Sales by Category
- Sales by Brand
- User growth timeline
- Best-selling products
- Low-stock alerts
- Pending work summary
- Recent orders
- System health stats
"""

from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from app.api.deps import require_permission
from app.schemas.dashboard import (
    OverviewOut,
    AdminOverviewOut,
    SalesSeriesOut,
    SalesByCategoryOut,
    SalesByBrandOut,
    UserGrowthOut,
    TopProductsOut,
    LowStockOut,
    PendingWorkSummaryOut,
    RecentOrdersOut,
    SystemHealthOut,
)
from app.services import dashboard as svc

router = APIRouter()  # mounted under /dashboard in main.py


@router.get(
    "/overview",
    response_model=OverviewOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_overview():
    """
    Get high-level dashboard summary including:
      - total orders
      - completed orders
      - total revenue
      - user count
      - product count

    Returns:
        OverviewOut: Aggregated numeric KPIs for UI display.
    """
    try:
        data = await svc.get_overview()
        return OverviewOut(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load overview: {e}")


@router.get(
    "/admin-overview",
    response_model=AdminOverviewOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_admin_overview():
    """
    Get complete admin dashboard overview including:
      - Total earnings/revenue
      - Pending orders count
      - Pending returns count
      - Pending exchanges count
      - Total categories count
      - Total brands count
      - Total products count
      - Total orders count
      - Total users count
      - Completed orders count
      - Out of stock products count

    Returns:
        AdminOverviewOut: Complete admin dashboard metrics for UI display.
    """
    try:
        data = await svc.get_admin_overview()
        return AdminOverviewOut(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load admin overview: {e}")


@router.get(
    "/sales-by-category",
    response_model=SalesByCategoryOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_sales_by_category():
    """
    Get sales breakdown by product category.

    Returns:
        SalesByCategoryOut: List of categories with their sales metrics
        including total orders, quantity sold, and revenue.
    """
    try:
        data = await svc.get_sales_by_category()
        return SalesByCategoryOut(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load sales by category: {e}")


@router.get(
    "/sales-by-brand",
    response_model=SalesByBrandOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_sales_by_brand():
    """
    Get sales breakdown by product brand.

    Returns:
        SalesByBrandOut: List of brands with their sales metrics
        including total orders, quantity sold, and revenue.
    """
    try:
        data = await svc.get_sales_by_brand()
        return SalesByBrandOut(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load sales by brand: {e}")


@router.get(
    "/pending-work",
    response_model=PendingWorkSummaryOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_pending_work_summary(limit: int = Query(10, ge=1, le=100)):
    """
    Get summary of all pending work items including:
      - Pending orders
      - Pending returns
      - Pending exchanges

    Args:
        limit (int): Maximum number of items per category (default: 10).

    Returns:
        PendingWorkSummaryOut: Lists of pending items with counts.
    """
    try:
        data = await svc.get_pending_work_summary(limit)
        return PendingWorkSummaryOut(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load pending work summary: {e}")


@router.get(
    "/recent-orders",
    response_model=RecentOrdersOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_recent_orders(limit: int = Query(10, ge=1, le=100)):
    """
    Get recent orders for dashboard display.

    Args:
        limit (int): Maximum number of orders to return (default: 10).

    Returns:
        RecentOrdersOut: List of recent orders with total count.
    """
    try:
        data = await svc.get_recent_orders(limit)
        return RecentOrdersOut(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load recent orders: {e}")


@router.get(
    "/sales",
    response_model=SalesSeriesOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_sales(days: int = Query(30, ge=1, le=365)):
    """
    Time-series graph: total sales revenue per day.

    Args:
        days (int): Number of recent days to include (max 365).

    Returns:
        SalesSeriesOut: (days, list of {date, total_sales} points)
    """
    try:
        series = await svc.sales_series(days)
        return SalesSeriesOut(days=days, series=series)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load sales series: {e}")


@router.get(
    "/user-growth",
    response_model=UserGrowthOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_user_growth(days: int = Query(30, ge=1, le=365)):
    """
    Time-series graph: number of new users registered per day.

    Args:
        days (int): Number of recent days to include.

    Returns:
        UserGrowthOut: (days, list of {date, count} points)
    """
    try:
        series = await svc.user_growth(days)
        return UserGrowthOut(days=days, series=series)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load user growth series: {e}")


@router.get(
    "/top-products",
    response_model=TopProductsOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_top_products(limit: int = Query(10, ge=1, le=100)):
    """
    Get highest-selling products for leaderboard charts.

    Args:
        limit (int): Maximum number of products to return.

    Returns:
        TopProductsOut: Ranked list of products with total sold qty.
    """
    try:
        items = await svc.top_products(limit)
        return TopProductsOut(limit=limit, items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load top products: {e}")


@router.get(
    "/low-stock",
    response_model=LowStockOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_low_stock(threshold: int = Query(10, ge=0, le=10_000)):
    """
    List items that are at or below a given stock threshold.

    Args:
        threshold (int): Minimum stock level to trigger alert.

    Returns:
        LowStockOut: Items with remaining_qty <= threshold
    """
    try:
        items = await svc.low_stock(threshold)
        return LowStockOut(threshold=threshold, items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load low-stock items: {e}")


@router.get(
    "/system-health",
    response_model=SystemHealthOut,
    dependencies=[Depends(require_permission("dashboard", "Read"))],
)
async def get_system_health():
    """
    Show real-time system diagnostics including:
      - DB health
      - API latency
      - Orders log trends
      - Error counts

    Returns:
        SystemHealthOut: Aggregated key operational metrics.
    """
    try:
        data = await svc.system_health()
        return SystemHealthOut(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load system health: {e}")