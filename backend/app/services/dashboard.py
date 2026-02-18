"""
Dashboard Analytics Service

Provides aggregated insights for the admin dashboard such as:
- System overview counts
- Sales series
- User growth trends
- Top-selling products
- Low-stock products
- System backup/restore health
"""

from __future__ import annotations
import datetime as dt
from datetime import datetime, timezone
from typing import List, Dict, Any

from bson import ObjectId
from app.core.database import db

TZ = "Asia/Kolkata"


def _date_floor_utc(days_back: int) -> datetime:
    """
    Compute a UTC datetime representing midnight (00:00:00 UTC) N days ago.

    Args:
        days_back (int): Number of days in the past to compute from.

    Returns:
        datetime: Midnight UTC timestamp N days before today.
    """
    now = datetime.now(timezone.utc)
    start = now - dt.timedelta(days=days_back)
    return datetime(start.year, start.month, start.day)


async def get_overview() -> Dict[str, Any]:
    """
    Compute high-level system metrics for the admin dashboard.

    Metrics include:
      - Total users
      - Total products
      - Total orders
      - Total returns
      - Total exchanges
      - Total revenue (from successful payments)

    Returns:
        Dict[str, Any]: Aggregated counts and revenue value.
    """
    users = await db["users"].count_documents({})
    products = await db["products"].count_documents({})
    orders = await db["orders"].count_documents({})
    returns = await db["returns"].count_documents({})
    exchanges = await db["exchanges"].count_documents({})

    # Find payment_status IDs marked as "success"
    paid_status_ids = []
    async for s in db["payment_status"].find({"status": {"$in": ["success"]}}, {"_id": 1}):
        paid_status_ids.append(s["_id"])

    match_stage = {"payment_status_id": {"$in": paid_status_ids}} if paid_status_ids else {}
    pipeline = [
        {"$match": match_stage} if match_stage else {"$match": {"amount": {"$ne": None}}},
        {"$group": {"_id": None, "sum": {"$sum": {"$ifNull": ["$amount", 0]}}}},
    ]
    agg = await db["payments"].aggregate(pipeline).to_list(1)
    revenue = float(agg[0]["sum"]) if agg else 0.0

    return {
        "users": users,
        "products": products,
        "orders": orders,
        "returns": returns,
        "exchanges": exchanges,
        "revenue": revenue,
    }


async def sales_series(days: int) -> List[Dict[str, Any]]:
    """
    Aggregate daily sales revenue over the specified number of days.

    Args:
        days (int): Number of days to include (e.g., last 30 days).

    Returns:
        List[Dict[str, Any]]: A list of daily {date, value} pairs where
        `value` is total payment amount on that date.
    """
    start_utc = _date_floor_utc(days)
    pipeline = [
        {"$match": {"createdAt": {"$gte": start_utc}}},
        {"$group": {
            "_id": {
                "$dateTrunc": {
                    "date": "$createdAt",
                    "unit": "day",
                    "timezone": TZ
                }
            },
            "value": {"$sum": {"$ifNull": ["$amount", 0]}},
        }},
        {"$sort": {"_id": 1}},
    ]
    rows = await db["payments"].aggregate(pipeline).to_list(None)
    return [{"date": r["_id"].date().isoformat(), "value": float(r["value"])} for r in rows]


async def user_growth(days: int) -> List[Dict[str, Any]]:
    """
    Aggregate count of new user registrations per day.

    Args:
        days (int): Days in the past to compute.

    Returns:
        List[Dict]: List of {date, value} where `value` is number of users joined that day.
    """
    start_utc = _date_floor_utc(days)
    pipeline = [
        {"$match": {"createdAt": {"$gte": start_utc}}},
        {"$group": {
            "_id": {
                "$dateTrunc": {
                    "date": "$createdAt",
                    "unit": "day",
                    "timezone": TZ
                }
            },
            "value": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    rows = await db["users"].aggregate(pipeline).to_list(None)
    return [{"date": r["_id"].date().isoformat(), "value": float(r["value"])} for r in rows]


async def top_products(limit: int) -> List[Dict[str, Any]]:
    """
    Find the top-selling products by quantity and revenue.

    Args:
        limit (int): Maximum number of products to return.

    Returns:
        List[Dict[str, Any]]: List of products with aggregated sale details:
            - product_id
            - name
            - total_quantity sold
            - total_orders count
            - total_revenue computed
    """
    pipeline = [
        {"$lookup": {
            "from": "products",
            "localField": "product_id",
            "foreignField": "_id",
            "as": "prod"
        }},
        {"$unwind": "$prod"},
        {"$group": {
            "_id": "$product_id",
            "name": {"$first": "$prod.name"},
            "total_quantity": {"$sum": {"$ifNull": ["$quantity", 0]}},
            "total_orders": {"$addToSet": "$order_id"},
            "unit_price": {"$first": {"$ifNull": ["$prod.total_price", 0]}},
        }},
        {"$project": {
            "_id": 0,
            "product_id": {"$toString": "$_id"},
            "name": 1,
            "total_quantity": 1,
            "total_orders": {"$size": "$total_orders"},
            "total_revenue": {"$multiply": ["$total_quantity", "$unit_price"]},
        }},
        {"$sort": {"total_quantity": -1, "total_revenue": -1}},
        {"$limit": limit},
    ]
    rows = await db["order_item"].aggregate(pipeline).to_list(None)
    for r in rows:
        r["total_revenue"] = float(r.get("total_revenue", 0.0))
        r["total_quantity"] = int(r.get("total_quantity", 0))
        r["total_orders"] = int(r.get("total_orders", 0))
    return rows


async def low_stock(threshold: int) -> List[Dict[str, Any]]:
    """
    Return list of products whose quantity is below or equal to a threshold.

    Args:
        threshold (int): Minimum stock threshold.

    Returns:
        List[Dict[str, Any]]: product_id, name, and current quantity.
    """
    cursor = db["products"].find({"quantity": {"$lte": threshold}}, {"_id": 1, "name": 1, "quantity": 1}).sort("quantity", 1)
    items: List[Dict[str, Any]] = []
    async for d in cursor:
        items.append({
            "product_id": str(d["_id"]),
            "name": d.get("name", ""),
            "quantity": int(d.get("quantity", 0)),
        })
    return items


async def system_health() -> Dict[str, Any]:
    """
    Summarize system backups and restore health.

    Returned information:
      - Last backup record (status, timestamps, size)
      - Failed backups in last 7 days
      - Failed restores in last 7 days

    Returns:
        Dict[str, Any]: System health summary.
    """
    last_backup = await db["backup_logs"].find({}).sort("createdAt", -1).limit(1).to_list(1)
    lb = last_backup[0] if last_backup else None

    last_backup_info = None
    if lb:
        last_backup_info = {
            "status": lb.get("status"),
            "scope": lb.get("scope"),
            "frequency": lb.get("frequency"),
            "size": lb.get("size"),
            "path": lb.get("path"),
            "scheduled_at": lb.get("scheduled_at").isoformat() if lb.get("scheduled_at") else None,
            "started_at": lb.get("started_at").isoformat() if lb.get("started_at") else None,
            "finished_at": lb.get("finished_at").isoformat() if lb.get("finished_at") else None,
            "createdAt": lb.get("createdAt").isoformat() if lb.get("createdAt") else None,
            "updatedAt": lb.get("updatedAt").isoformat() if lb.get("updatedAt") else None,
        }

    since = dt.datetime.now(timezone.utc) - dt.timedelta(days=7)

    failed_backups_7d = await db["backup_logs"].count_documents({
        "createdAt": {"$gte": since},
        "status": "failed"
    })

    failed_restores_7d = await db["restore_logs"].count_documents({
        "createdAt": {"$gte": since},
        "status": "failed"
    })

    return {
        "last_backup": last_backup_info,
        "failed_backups_7d": failed_backups_7d,
        "failed_restores_7d": failed_restores_7d,
    }


# ---------- Admin Dashboard Functions ----------

async def get_admin_overview() -> Dict[str, Any]:
    """
    Get complete admin dashboard overview with:
      - Total earnings/revenue
      - Pending orders, returns, exchanges counts
      - Total categories, brands, products, orders, users
      - Completed orders count
      - Out of stock products count

    Returns:
        Dict[str, Any]: Aggregated admin dashboard metrics.
    """
    # Counts
    total_categories = await db["categories"].count_documents({})
    total_brands = await db["brands"].count_documents({})
    total_products = await db["products"].count_documents({})
    total_orders = await db["orders"].count_documents({})
    total_users = await db["users"].count_documents({})
    out_of_stock = await db["products"].count_documents({"out_of_stock": True})

    # Get pending status IDs for orders
    pending_order_statuses = []
    async for s in db["order_status"].find(
        {"status": {"$regex": "pending|processing|confirmed|shipped", "$options": "i"}},
        {"_id": 1}
    ):
        pending_order_statuses.append(s["_id"])
    
    pending_orders_count = 0
    if pending_order_statuses:
        pending_orders_count = await db["orders"].count_documents({
            "status_id": {"$in": pending_order_statuses}
        })

    # Get completed/delivered order status IDs
    completed_order_statuses = []
    async for s in db["order_status"].find(
        {"status": {"$regex": "delivered|completed", "$options": "i"}},
        {"_id": 1}
    ):
        completed_order_statuses.append(s["_id"])
    
    completed_orders_count = 0
    if completed_order_statuses:
        completed_orders_count = await db["orders"].count_documents({
            "status_id": {"$in": completed_order_statuses}
        })

    # Get pending return status IDs
    pending_return_statuses = []
    async for s in db["return_status"].find(
        {"status": {"$regex": "pending|requested|processing", "$options": "i"}},
        {"_id": 1}
    ):
        pending_return_statuses.append(s["_id"])
    
    pending_returns_count = 0
    if pending_return_statuses:
        pending_returns_count = await db["returns"].count_documents({
            "return_status_id": {"$in": pending_return_statuses}
        })

    # Get pending exchange status IDs
    pending_exchange_statuses = []
    async for s in db["exchange_status"].find(
        {"status": {"$regex": "pending|requested|processing", "$options": "i"}},
        {"_id": 1}
    ):
        pending_exchange_statuses.append(s["_id"])
    
    pending_exchanges_count = 0
    if pending_exchange_statuses:
        pending_exchanges_count = await db["exchanges"].count_documents({
            "exchange_status_id": {"$in": pending_exchange_statuses}
        })

    # Total earnings from successful payments
    paid_status_ids = []
    async for s in db["payment_status"].find({"status": {"$in": ["success"]}}, {"_id": 1}):
        paid_status_ids.append(s["_id"])

    total_earnings = 0.0
    if paid_status_ids:
        pipeline = [
            {"$match": {"payment_status_id": {"$in": paid_status_ids}}},
            {"$group": {"_id": None, "sum": {"$sum": {"$ifNull": ["$amount", 0]}}}},
        ]
        agg = await db["payments"].aggregate(pipeline).to_list(1)
        total_earnings = float(agg[0]["sum"]) if agg else 0.0

    return {
        "total_earnings": total_earnings,
        "pending_orders": pending_orders_count,
        "pending_returns": pending_returns_count,
        "pending_exchanges": pending_exchanges_count,
        "total_categories": total_categories,
        "total_brands": total_brands,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "completed_orders": completed_orders_count,
        "out_of_stock_products": out_of_stock,
    }


async def get_sales_by_category() -> Dict[str, Any]:
    """
    Get sales breakdown by category.

    Returns:
        Dict with categories list and total count.
    """
    pipeline = [
        # Join order_items with products to get category_id
        {"$lookup": {
            "from": "products",
            "localField": "product_id",
            "foreignField": "_id",
            "as": "product"
        }},
        {"$unwind": {"path": "$product", "preserveNullAndEmptyArrays": False}},
        # Join with categories to get category name
        {"$lookup": {
            "from": "categories",
            "localField": "product.category_id",
            "foreignField": "_id",
            "as": "category"
        }},
        {"$unwind": {"path": "$category", "preserveNullAndEmptyArrays": False}},
        # Group by category
        {"$group": {
            "_id": "$product.category_id",
            "category_name": {"$first": "$category.category"},
            "total_quantity": {"$sum": {"$ifNull": ["$quantity", 1]}},
            "total_orders": {"$addToSet": "$order_id"},
            "unit_prices": {"$push": {"$ifNull": ["$product.total_price", 0]}},
            "quantities": {"$push": {"$ifNull": ["$quantity", 1]}}
        }},
        # Calculate revenue
        {"$project": {
            "_id": 0,
            "category_id": {"$toString": "$_id"},
            "category_name": 1,
            "total_quantity": 1,
            "total_orders": {"$size": "$total_orders"},
            "total_revenue": {
                "$reduce": {
                    "input": {"$range": [0, {"$size": "$unit_prices"}]},
                    "initialValue": 0,
                    "in": {
                        "$add": [
                            "$$value",
                            {"$multiply": [
                                {"$arrayElemAt": ["$unit_prices", "$$this"]},
                                {"$arrayElemAt": ["$quantities", "$$this"]}
                            ]}
                        ]
                    }
                }
            }
        }},
        {"$sort": {"total_revenue": -1}}
    ]
    
    categories = await db["order_items"].aggregate(pipeline).to_list(None)
    
    # Ensure proper types
    for cat in categories:
        cat["total_quantity"] = int(cat.get("total_quantity", 0))
        cat["total_orders"] = int(cat.get("total_orders", 0))
        cat["total_revenue"] = float(cat.get("total_revenue", 0.0))
    
    return {
        "categories": categories,
        "total_categories": len(categories)
    }


async def get_sales_by_brand() -> Dict[str, Any]:
    """
    Get sales breakdown by brand.

    Returns:
        Dict with brands list and total count.
    """
    pipeline = [
        # Join order_items with products to get brand_id
        {"$lookup": {
            "from": "products",
            "localField": "product_id",
            "foreignField": "_id",
            "as": "product"
        }},
        {"$unwind": {"path": "$product", "preserveNullAndEmptyArrays": False}},
        # Join with brands to get brand name
        {"$lookup": {
            "from": "brands",
            "localField": "product.brand_id",
            "foreignField": "_id",
            "as": "brand"
        }},
        {"$unwind": {"path": "$brand", "preserveNullAndEmptyArrays": False}},
        # Group by brand
        {"$group": {
            "_id": "$product.brand_id",
            "brand_name": {"$first": "$brand.name"},
            "total_quantity": {"$sum": {"$ifNull": ["$quantity", 1]}},
            "total_orders": {"$addToSet": "$order_id"},
            "unit_prices": {"$push": {"$ifNull": ["$product.total_price", 0]}},
            "quantities": {"$push": {"$ifNull": ["$quantity", 1]}}
        }},
        # Calculate revenue
        {"$project": {
            "_id": 0,
            "brand_id": {"$toString": "$_id"},
            "brand_name": 1,
            "total_quantity": 1,
            "total_orders": {"$size": "$total_orders"},
            "total_revenue": {
                "$reduce": {
                    "input": {"$range": [0, {"$size": "$unit_prices"}]},
                    "initialValue": 0,
                    "in": {
                        "$add": [
                            "$$value",
                            {"$multiply": [
                                {"$arrayElemAt": ["$unit_prices", "$$this"]},
                                {"$arrayElemAt": ["$quantities", "$$this"]}
                            ]}
                        ]
                    }
                }
            }
        }},
        {"$sort": {"total_revenue": -1}}
    ]
    
    brands = await db["order_items"].aggregate(pipeline).to_list(None)
    
    # Ensure proper types
    for brand in brands:
        brand["total_quantity"] = int(brand.get("total_quantity", 0))
        brand["total_orders"] = int(brand.get("total_orders", 0))
        brand["total_revenue"] = float(brand.get("total_revenue", 0.0))
    
    return {
        "brands": brands,
        "total_brands": len(brands)
    }


async def get_pending_work_summary(limit: int = 10) -> Dict[str, Any]:
    """
    Get summary of all pending work items (orders, returns, exchanges).

    Args:
        limit: Maximum number of items to return per category.

    Returns:
        Dict with pending orders, returns, exchanges lists and counts.
    """
    # Get pending order status IDs
    pending_order_statuses = []
    async for s in db["order_status"].find(
        {"status": {"$regex": "pending|processing|confirmed|shipped", "$options": "i"}},
        {"_id": 1, "status": 1}
    ):
        pending_order_statuses.append(s)
    
    pending_order_status_ids = [s["_id"] for s in pending_order_statuses]
    status_map = {str(s["_id"]): s["status"] for s in pending_order_statuses}

    # Get pending orders
    pending_orders = []
    pending_orders_count = 0
    if pending_order_status_ids:
        pending_orders_count = await db["orders"].count_documents({
            "status_id": {"$in": pending_order_status_ids}
        })
        
        cursor = db["orders"].find(
            {"status_id": {"$in": pending_order_status_ids}}
        ).sort("createdAt", -1).limit(limit)
        
        async for doc in cursor:
            pending_orders.append({
                "order_id": str(doc["_id"]),
                "user_id": str(doc.get("user_id", "")),
                "total": float(doc.get("total", 0.0)),
                "status": status_map.get(str(doc.get("status_id", "")), None),
                "delivery_date": doc.get("delivery_date").isoformat() if doc.get("delivery_date") else None,
                "created_at": doc.get("createdAt")
            })

    # Get pending return status IDs
    pending_return_statuses = []
    async for s in db["return_status"].find(
        {"status": {"$regex": "pending|requested|processing", "$options": "i"}},
        {"_id": 1, "status": 1}
    ):
        pending_return_statuses.append(s)
    
    pending_return_status_ids = [s["_id"] for s in pending_return_statuses]
    return_status_map = {str(s["_id"]): s["status"] for s in pending_return_statuses}

    # Get pending returns
    pending_returns = []
    pending_returns_count = 0
    if pending_return_status_ids:
        pending_returns_count = await db["returns"].count_documents({
            "return_status_id": {"$in": pending_return_status_ids}
        })
        
        cursor = db["returns"].find(
            {"return_status_id": {"$in": pending_return_status_ids}}
        ).sort("createdAt", -1).limit(limit)
        
        async for doc in cursor:
            pending_returns.append({
                "return_id": str(doc["_id"]),
                "order_id": str(doc.get("order_id", "")),
                "user_id": str(doc.get("user_id", "")),
                "product_id": str(doc.get("product_id", "")),
                "reason": doc.get("reason"),
                "return_status": return_status_map.get(str(doc.get("return_status_id", "")), None),
                "created_at": doc.get("createdAt")
            })

    # Get pending exchange status IDs
    pending_exchange_statuses = []
    async for s in db["exchange_status"].find(
        {"status": {"$regex": "pending|requested|processing", "$options": "i"}},
        {"_id": 1, "status": 1}
    ):
        pending_exchange_statuses.append(s)
    
    pending_exchange_status_ids = [s["_id"] for s in pending_exchange_statuses]
    exchange_status_map = {str(s["_id"]): s["status"] for s in pending_exchange_statuses}

    # Get pending exchanges
    pending_exchanges = []
    pending_exchanges_count = 0
    if pending_exchange_status_ids:
        pending_exchanges_count = await db["exchanges"].count_documents({
            "exchange_status_id": {"$in": pending_exchange_status_ids}
        })
        
        cursor = db["exchanges"].find(
            {"exchange_status_id": {"$in": pending_exchange_status_ids}}
        ).sort("createdAt", -1).limit(limit)
        
        async for doc in cursor:
            pending_exchanges.append({
                "exchange_id": str(doc["_id"]),
                "order_id": str(doc.get("order_id", "")),
                "user_id": str(doc.get("user_id", "")),
                "product_id": str(doc.get("product_id", "")),
                "reason": doc.get("reason"),
                "exchange_status": exchange_status_map.get(str(doc.get("exchange_status_id", "")), None),
                "created_at": doc.get("createdAt")
            })

    return {
        "pending_orders": pending_orders,
        "pending_returns": pending_returns,
        "pending_exchanges": pending_exchanges,
        "pending_orders_count": pending_orders_count,
        "pending_returns_count": pending_returns_count,
        "pending_exchanges_count": pending_exchanges_count,
    }


async def get_recent_orders(limit: int = 10) -> Dict[str, Any]:
    """
    Get recent orders for dashboard display.

    Args:
        limit: Maximum number of orders to return.

    Returns:
        Dict with orders list and total count.
    """
    total_count = await db["orders"].count_documents({})
    
    # Get all order statuses for mapping
    status_map = {}
    async for s in db["order_status"].find({}, {"_id": 1, "status": 1}):
        status_map[str(s["_id"])] = s["status"]

    orders = []
    cursor = db["orders"].find({}).sort("createdAt", -1).limit(limit)
    
    async for doc in cursor:
        orders.append({
            "order_id": str(doc["_id"]),
            "user_id": str(doc.get("user_id", "")),
            "total": float(doc.get("total", 0.0)),
            "status": status_map.get(str(doc.get("status_id", "")), None),
            "payment_method": doc.get("payment_method"),
            "delivery_date": doc.get("delivery_date").isoformat() if doc.get("delivery_date") else None,
            "created_at": doc.get("createdAt")
        })

    return {
        "orders": orders,
        "total_count": total_count
    }