"""
Service layer for Returns.
- Owns business rules, DB access orchestration, and GridFS image handling.
- Auto-derives delivery_date from the order and enforces a 7-day return window.
"""

from __future__ import annotations
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, date

from bson import ObjectId
from fastapi import HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.core.database import db
from app.schemas.object_id import PyObjectId
from app.schemas.returns import ReturnsCreate, ReturnsUpdate, ReturnsOut
from app.crud import returns as crud
from app.utils.gridfs import upload_image


# -------------- helpers --------------

def _to_oid(v: Any, field: str) -> ObjectId:
    """
    Cast a value to ObjectId or raise 400 with a helpful field name.

    Args:
        v: Value to cast.
        field: Field name context.

    Returns:
        ObjectId

    Raises:
        HTTPException 400 if invalid.
    """
    try:
        return ObjectId(str(v))
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {field}")


async def _get_status_id(label: str) -> ObjectId:
    """
    Find a return status _id by its label (e.g., 'requested').

    Raises:
        HTTPException 500 if missing in configuration.
    """
    doc = await db["return_status"].find_one({"status": label})
    if not doc:
        raise HTTPException(status_code=500, detail=f"Return status '{label}' not found")
    return doc["_id"]


async def _load_order_item(oi_id: PyObjectId) -> dict:
    """
    Load order_items document by id or raise 404.
    """
    oi = await db["order_items"].find_one({"_id": _to_oid(oi_id, "order_item_id")})
    if not oi:
        raise HTTPException(status_code=404, detail="Order item not found")
    return oi


async def _load_order(order_id: ObjectId) -> dict:
    """
    Load orders document by id or raise 404.
    """
    order = await db["orders"].find_one({"_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


async def _load_product(product_id: ObjectId) -> dict:
    """
    Load products document by id or raise 404.
    """
    prod = await db["products"].find_one({"_id": product_id})
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod


async def _already_returned_qty(order_id: ObjectId, product_id: ObjectId) -> int:
    """
    Sum quantity already returned for (order_id, product_id).

    Returns:
        int: previously returned quantity.
    """
    pipeline = [
        {"$match": {"order_id": order_id, "product_id": product_id}},
        {"$group": {"_id": None, "q": {"$sum": {"$ifNull": ["$quantity", 0]}}}},
    ]
    total = 0
    async for row in db["returns"].aggregate(pipeline):
        total = int(row.get("q", 0))
    return total


def _price_of(prod: dict) -> float:
    """
    Determine unit price for return amount calculation.

    Prefers:
      - total_price (if present)
      - price
      - else 0.0
    """
    val = prod.get("total_price", prod.get("price", 0.0))
    try:
        return float(val)
    except Exception:
        return 0.0


def _ensure_within_7_days(delivery_date: date) -> None:
    """
    Ensure the provided delivery_date is within the last 7 days inclusive.

    Raises:
        HTTPException 400 if outside window or in the future.
    """
    today = datetime.now(timezone.utc).date()
    delta_days = (today - delivery_date).days
    if delta_days < 0:
        raise HTTPException(status_code=400, detail="Delivery date cannot be in the future")
    if delta_days > 7:
        raise HTTPException(status_code=400, detail="Return window expired (delivery + 7 days)")


def _parse_delivery_date_from_order(order: dict) -> date:
    """
    Extract and normalize delivery_date from an order document.

    Supports:
      - datetime → .date()
      - ISO date/time string → parsed
      - date → as-is

    Raises:
        HTTPException 400/500 if missing or invalid.
    """
    delivery_date = order.get("delivery_date")
    if not delivery_date:
        raise HTTPException(
            status_code=400,
            detail="Order does not contain delivery_date; return cannot be created.",
        )

    if isinstance(delivery_date, datetime):
        return delivery_date.date()
    if isinstance(delivery_date, date):
        return delivery_date
    if isinstance(delivery_date, str):
        try:
            # Try ISO format first
            return datetime.fromisoformat(delivery_date).date()
        except Exception:
            raise HTTPException(status_code=500, detail="delivery_date in DB is not a valid ISO date format")

    raise HTTPException(status_code=500, detail="delivery_date format in DB is invalid")


def _get_days_remaining(delivery_date: date) -> int:
    """Get days remaining for return window."""
    today = datetime.now(timezone.utc).date()
    days_since_delivery = (today - delivery_date).days
    return max(0, 7 - days_since_delivery)


# -------------- services --------------

async def get_return_options_service(
    order_item_id: PyObjectId,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Get return options for an order item.
    
    Returns:
        - can_return: bool (within 7-day window and has returnable quantity)
        - days_remaining: int
        - product: product details
        - ordered_quantity: original quantity ordered
        - already_returned: quantity already returned
        - returnable_quantity: how many can still be returned
        - refund_per_item: refund amount per item
        - max_refund: maximum possible refund
    """
    user_oid = _to_oid(current_user["user_id"], "user_id")
    
    # Load order item
    oi = await _load_order_item(order_item_id)
    order_id: ObjectId = oi["order_id"]
    product_id: ObjectId = oi["product_id"]
    ordered_qty: int = int(oi.get("quantity", 0))
    size = oi.get("size", "")
    
    # Load order and verify ownership
    order = await _load_order(order_id)
    if str(order.get("user_id")) != str(user_oid):
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Get delivery date
    delivery_date_raw = order.get("delivery_date")
    if not delivery_date_raw:
        return {
            "can_return": False,
            "message": "Order does not have a delivery date",
            "days_remaining": 0,
            "product": None,
            "ordered_quantity": ordered_qty,
            "already_returned": 0,
            "returnable_quantity": 0,
            "refund_per_item": 0,
            "max_refund": 0,
        }
    
    # Parse delivery date
    try:
        if isinstance(delivery_date_raw, datetime):
            delivery_date = delivery_date_raw.date()
        elif isinstance(delivery_date_raw, date):
            delivery_date = delivery_date_raw
        elif isinstance(delivery_date_raw, str):
            delivery_date = datetime.fromisoformat(delivery_date_raw).date()
        else:
            delivery_date = None
    except Exception:
        delivery_date = None
    
    if not delivery_date:
        return {
            "can_return": False,
            "message": "Invalid delivery date",
            "days_remaining": 0,
        }
    
    # Check if within return window
    today = datetime.now(timezone.utc).date()
    days_since_delivery = (today - delivery_date).days
    
    if days_since_delivery < 0:
        return {
            "can_return": False,
            "message": "Order has not been delivered yet",
            "days_remaining": 0,
            "product": None,
            "ordered_quantity": ordered_qty,
            "already_returned": 0,
            "returnable_quantity": 0,
            "refund_per_item": 0,
            "max_refund": 0,
        }
    
    days_remaining = max(0, 7 - days_since_delivery)
    
    # Get already returned quantity
    already_returned = await _already_returned_qty(order_id, product_id)
    returnable_qty = max(0, ordered_qty - already_returned)
    
    # Get product details
    product = await db["products"].find_one(
        {"_id": product_id},
        {"name": 1, "description": 1, "price": 1, "total_price": 1, "thumbnail_url": 1, "color": 1}
    )
    
    if not product:
        return {
            "can_return": False,
            "message": "Product not found",
            "days_remaining": days_remaining,
            "product": None,
            "ordered_quantity": ordered_qty,
            "already_returned": already_returned,
            "returnable_quantity": 0,
            "refund_per_item": 0,
            "max_refund": 0,
        }
    
    unit_price = _price_of(product)
    
    product_info = {
        "id": str(product["_id"]),
        "name": product.get("name", "Unknown"),
        "description": product.get("description", ""),
        "price": unit_price,
        "thumbnail_url": product.get("thumbnail_url"),
        "color": product.get("color"),
    }
    
    can_return = days_remaining > 0 and returnable_qty > 0
    
    message = None
    if days_remaining == 0:
        message = "Return window has expired (7 days after delivery)"
    elif returnable_qty == 0:
        message = "All items from this order have already been returned"
    
    return {
        "can_return": can_return,
        "message": message,
        "days_remaining": days_remaining,
        "product": product_info,
        "size": size,
        "ordered_quantity": ordered_qty,
        "already_returned": already_returned,
        "returnable_quantity": returnable_qty,
        "refund_per_item": unit_price,
        "max_refund": round(unit_price * returnable_qty, 2),
        "order_item_id": str(order_item_id),
        "order_id": str(order_id),
    }


async def create_return_service(
    order_item_id: PyObjectId,
    quantity: int,
    reason: Optional[str],
    image: UploadFile = None,
    current_user: Dict[str, Any] = None,
) -> ReturnsOut:
    """
    Create a return for an order item owned by the current user.

    Flow:
      1) Validate `quantity > 0`
      2) Load order_item → (order_id, product_id, ordered_qty)
      3) Load order; ensure ownership; read & validate `delivery_date` (≤ 7 days)
      4) Ensure not exceeding available quantity (ordered - already returned)
      5) Compute amount = unit_price * quantity
      6) Upload image if provided
      7) Set status to 'requested' and create

    Returns:
        ReturnsOut
    """
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="quantity must be greater than 0")

    # Load order_item + linked order/product
    oi = await _load_order_item(order_item_id)
    order_id: ObjectId = oi["order_id"]
    product_id: ObjectId = oi["product_id"]
    ordered_qty: int = int(oi.get("quantity", 0))

    # Load order and enforce ownership
    order = await _load_order(order_id)
    if str(order.get("user_id")) != str(current_user.get("user_id")):
        raise HTTPException(status_code=403, detail="Forbidden")

    # Enforce return window using order.delivery_date
    delivery_date = _parse_delivery_date_from_order(order)
    _ensure_within_7_days(delivery_date)

    # Quantity guard considering already returned
    prior = await _already_returned_qty(order_id, product_id)
    available = max(0, ordered_qty - prior)
    if quantity > available:
        raise HTTPException(
            status_code=400,
            detail=f"Only {available} items can be returned for this order item",
        )

    # Price and amount calculation
    prod = await _load_product(product_id)
    unit_price = _price_of(prod)
    amount = round(unit_price * quantity, 2)

    # Image handling (optional)
    final_url: Optional[str] = None
    if image is not None:
        _, final_url = await upload_image(image)

    # Status: approved (default per business rule)
    status_id = await _get_status_id("approved")

    payload = ReturnsCreate(
        order_id=order_id,
        order_item_id=PyObjectId(str(oi["_id"])),
        product_id=product_id,
        return_status_id=status_id,
        user_id=_to_oid(current_user["user_id"], "user_id"),
        reason=reason,
        image_url=final_url,
        quantity=quantity,
        amount=amount,
    )

    try:
        result = await crud.create(payload)
        
        # Update order_item status to "return_requested"
        await db["order_items"].update_one(
            {"_id": oi["_id"]},
            {"$set": {"item_status": "return_requested"}, "$currentDate": {"updatedAt": True}}
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create return: {e}")


async def list_my_returns_service(
    skip: int,
    limit: int,
    current_user: Dict[str, Any],
) -> List[ReturnsOut]:
    """
    List returns created by the current user.
    """
    try:
        q = {"user_id": _to_oid(current_user["user_id"], "user_id")}
        return await crud.list_all(skip=skip, limit=limit, query=q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list returns: {e}")


async def get_my_return_service(return_id: PyObjectId, current_user: Dict[str, Any]) -> ReturnsOut:
    """
    Get a single return that belongs to the current user.
    """
    try:
        item = await crud.get_one(return_id)
        if not item:
            raise HTTPException(status_code=404, detail="Return not found")
        if str(item.user_id) != str(current_user["user_id"]):
            raise HTTPException(status_code=403, detail="Forbidden")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get return: {e}")


async def admin_list_returns_service(
    skip: int,
    limit: int,
    user_id: Optional[PyObjectId],
    order_id: Optional[PyObjectId],
    product_id: Optional[PyObjectId],
    return_status_id: Optional[PyObjectId],
) -> List[ReturnsOut]:
    """
    Admin: list returns with optional filters.
    """
    try:
        q: Dict[str, Any] = {}
        if user_id is not None:
            q["user_id"] = _to_oid(user_id, "user_id")
        if order_id is not None:
            q["order_id"] = _to_oid(order_id, "order_id")
        if product_id is not None:
            q["product_id"] = _to_oid(product_id, "product_id")
        if return_status_id is not None:
            q["return_status_id"] = _to_oid(return_status_id, "return_status_id")
        return await crud.list_all(skip=skip, limit=limit, query=q or None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list returns: {e}")


async def admin_get_return_service(return_id: PyObjectId) -> ReturnsOut:
    """
    Admin: get a return by ID.
    """
    try:
        item = await crud.get_one(return_id)
        if not item:
            raise HTTPException(status_code=404, detail="Return not found")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get return: {e}")


async def admin_update_return_status_service(return_id: PyObjectId, payload: ReturnsUpdate) -> ReturnsOut:
    """
    Admin: update return status only (per ReturnsUpdate schema).
    
    When status changes to 'refunded', restores stock to the product.
    """
    try:
        if payload.return_status_id is None:
            raise HTTPException(status_code=400, detail="return_status_id is required")
        
        # Get the return document first to check current status and get details
        return_doc = await db["returns"].find_one({"_id": _to_oid(return_id, "return_id")})
        if not return_doc:
            raise HTTPException(status_code=404, detail="Return not found")
        
        # Get the new status label
        new_status_doc = await db["return_status"].find_one(
            {"_id": _to_oid(payload.return_status_id, "return_status_id")}
        )
        if not new_status_doc:
            raise HTTPException(status_code=400, detail="Invalid return_status_id")
        
        new_status_label = new_status_doc.get("status", "").lower()
        
        # Get current status label to prevent double stock restoration
        current_status_doc = await db["return_status"].find_one(
            {"_id": return_doc.get("return_status_id")}
        )
        current_status_label = current_status_doc.get("status", "").lower() if current_status_doc else ""
        
        # Restore stock when status changes to 'refunded' (and wasn't already refunded)
        if new_status_label == "refunded" and current_status_label != "refunded":
            product_id = return_doc.get("product_id")
            quantity = return_doc.get("quantity", 0)
            
            if product_id and quantity > 0:
                # Restore stock to product
                await db["products"].update_one(
                    {"_id": product_id},
                    {"$inc": {"quantity": quantity}, "$currentDate": {"updatedAt": True}}
                )
            
            # Update order_item status to "returned"
            order_item_id = return_doc.get("order_item_id")
            if order_item_id:
                await db["order_items"].update_one(
                    {"_id": order_item_id},
                    {"$set": {"item_status": "returned"}, "$currentDate": {"updatedAt": True}}
                )
        
        # Update order_item status to "return_rejected" when rejected
        if new_status_label == "rejected" and current_status_label != "rejected":
            order_item_id = return_doc.get("order_item_id")
            if order_item_id:
                await db["order_items"].update_one(
                    {"_id": order_item_id},
                    {"$set": {"item_status": "return_rejected"}, "$currentDate": {"updatedAt": True}}
                )
        
        updated = await crud.update_one(return_id, payload)
        if not updated:
            raise HTTPException(status_code=404, detail="Return not found or not updated")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update return: {e}")


async def admin_delete_return_service(return_id: PyObjectId):
    """
    Admin: delete a return.

    Returns:
        JSONResponse({"deleted": True})
    """
    try:
        ok = await crud.delete_one(return_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Return not found")
        return JSONResponse(status_code=200, content={"deleted": True})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete return: {e}")