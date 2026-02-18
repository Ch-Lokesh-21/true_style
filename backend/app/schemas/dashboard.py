from __future__ import annotations
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, NonNegativeInt, NonNegativeFloat


# ---------- Reusable small models ----------

class TimePoint(BaseModel):
    date: str = Field(..., description="ISO date (YYYY-MM-DD) in Asia/Kolkata")
    value: NonNegativeFloat = 0.0


# ---------- Overview (existing) ----------

class OverviewOut(BaseModel):
    users: NonNegativeInt = 0
    products: NonNegativeInt = 0
    orders: NonNegativeInt = 0
    returns: NonNegativeInt = 0
    exchanges: NonNegativeInt = 0
    revenue: NonNegativeFloat = 0.0


# ---------- Admin Dashboard Overview ----------

class AdminOverviewOut(BaseModel):
    """Complete admin dashboard overview with all key metrics"""
    total_earnings: NonNegativeFloat = Field(0.0, description="Total revenue/earnings")
    pending_orders: NonNegativeInt = Field(0, description="Number of pending orders")
    pending_returns: NonNegativeInt = Field(0, description="Number of pending returns")
    pending_exchanges: NonNegativeInt = Field(0, description="Number of pending exchanges")
    total_categories: NonNegativeInt = Field(0, description="Total number of categories")
    total_brands: NonNegativeInt = Field(0, description="Total number of brands")
    total_products: NonNegativeInt = Field(0, description="Total number of products")
    total_orders: NonNegativeInt = Field(0, description="Total number of orders")
    total_users: NonNegativeInt = Field(0, description="Total number of users")
    completed_orders: NonNegativeInt = Field(0, description="Number of completed/delivered orders")
    out_of_stock_products: NonNegativeInt = Field(0, description="Products that are out of stock")


# ---------- Sales by Category ----------

class CategorySalesItem(BaseModel):
    """Sales data for one category"""
    category_id: str = Field(..., description="Category ID")
    category_name: str = Field(..., description="Category name")
    total_orders: NonNegativeInt = Field(0, description="Number of orders in this category")
    total_quantity: NonNegativeInt = Field(0, description="Total items sold in this category")
    total_revenue: NonNegativeFloat = Field(0.0, description="Total revenue from this category")


class SalesByCategoryOut(BaseModel):
    """Sales breakdown by category"""
    categories: List[CategorySalesItem] = Field(default_factory=list)
    total_categories: NonNegativeInt = 0


# ---------- Sales by Brand ----------

class BrandSalesItem(BaseModel):
    """Sales data for one brand"""
    brand_id: str = Field(..., description="Brand ID")
    brand_name: str = Field(..., description="Brand name")
    total_orders: NonNegativeInt = Field(0, description="Number of orders for this brand")
    total_quantity: NonNegativeInt = Field(0, description="Total items sold for this brand")
    total_revenue: NonNegativeFloat = Field(0.0, description="Total revenue from this brand")


class SalesByBrandOut(BaseModel):
    """Sales breakdown by brand"""
    brands: List[BrandSalesItem] = Field(default_factory=list)
    total_brands: NonNegativeInt = 0


# ---------- Pending Work Summary ----------

class PendingOrderItem(BaseModel):
    """Pending order summary"""
    order_id: str
    user_id: str
    total: NonNegativeFloat = 0.0
    status: Optional[str] = None
    delivery_date: Optional[str] = None
    created_at: Optional[datetime] = None


class PendingReturnItem(BaseModel):
    """Pending return summary"""
    return_id: str
    order_id: str
    user_id: str
    product_id: str
    reason: Optional[str] = None
    return_status: Optional[str] = None
    created_at: Optional[datetime] = None


class PendingExchangeItem(BaseModel):
    """Pending exchange summary"""
    exchange_id: str
    order_id: str
    user_id: str
    product_id: str
    reason: Optional[str] = None
    exchange_status: Optional[str] = None
    created_at: Optional[datetime] = None


class PendingWorkSummaryOut(BaseModel):
    """Summary of all pending work items"""
    pending_orders: List[PendingOrderItem] = Field(default_factory=list)
    pending_returns: List[PendingReturnItem] = Field(default_factory=list)
    pending_exchanges: List[PendingExchangeItem] = Field(default_factory=list)
    pending_orders_count: NonNegativeInt = 0
    pending_returns_count: NonNegativeInt = 0
    pending_exchanges_count: NonNegativeInt = 0


# ---------- Recent Orders ----------

class RecentOrderItem(BaseModel):
    """Recent order item for dashboard display"""
    order_id: str
    user_id: str
    total: NonNegativeFloat = 0.0
    status: Optional[str] = None
    payment_method: Optional[str] = None
    delivery_date: Optional[str] = None
    created_at: Optional[datetime] = None


class RecentOrdersOut(BaseModel):
    """Recent orders list"""
    orders: List[RecentOrderItem] = Field(default_factory=list)
    total_count: NonNegativeInt = 0


# ---------- Sales (time series) ----------

class SalesSeriesOut(BaseModel):
    days: NonNegativeInt
    series: List[TimePoint]


# ---------- User growth (time series) ----------

class UserGrowthOut(BaseModel):
    days: NonNegativeInt
    series: List[TimePoint]


# ---------- Top products (by qty sold) ----------

class TopProductOut(BaseModel):
    product_id: str
    name: str
    total_quantity: NonNegativeInt
    total_orders: NonNegativeInt
    total_revenue: NonNegativeFloat


class TopProductsOut(BaseModel):
    limit: NonNegativeInt
    items: List[TopProductOut]


# ---------- Low stock ----------

class LowStockItemOut(BaseModel):
    product_id: str
    name: str
    quantity: NonNegativeInt


class LowStockOut(BaseModel):
    threshold: NonNegativeInt
    items: List[LowStockItemOut]


# ---------- System health (backups / restores) ----------

class LastBackupInfo(BaseModel):
    status: str
    scope: Optional[str] = None
    frequency: Optional[str] = None
    size: Optional[float] = None
    scheduled_at: Optional[str] = None
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    path: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class SystemHealthOut(BaseModel):
    last_backup: Optional[LastBackupInfo] = None
    failed_backups_7d: NonNegativeInt = 0
    failed_restores_7d: NonNegativeInt = 0