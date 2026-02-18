"""
Service layer for Exchanges.
- Owns the business rules, DB access orchestration, and GridFS handling.
- Enforces the 7-day delivery window on creation.
"""

from __future__ import annotations
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta, date

from bson import ObjectId
from fastapi import HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from app.api.deps import get_current_user  # only for typing/context if needed elsewhere
from app.core.database import db
from app.schemas.object_id import PyObjectId
from app.schemas.exchanges import ExchangesCreate, ExchangesUpdate, ExchangesOut
from app.crud import exchanges as crud
from app.utils.gridfs import upload_image, replace_image, delete_image, _extract_file_id_from_url


def _to_oid(v: Any, field: str) -> ObjectId:
    """
    Safely cast a value to ObjectId or raise 400 with a helpful message.

    Args:
        v: Any value that should represent an ObjectId.
        field: Field name for error context.

    Returns:
        ObjectId

    Raises:
        HTTPException 400 if cast fails.
    """
    try:
        return ObjectId(str(v))
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {field}")


async def _get_order_item(order_item_id: PyObjectId) -> dict:
    """
    Load the order_item document or raise 404.

    Args:
        order_item_id: Order item id.

    Returns:
        dict: order_item document.

    Raises:
        HTTPException 404 if not found.
    """
    oi = await db["order_items"].find_one({"_id": _to_oid(order_item_id, "order_item_id")})
    if not oi:
        raise HTTPException(status_code=404, detail="Order item not found")
    return oi


async def _assert_order_belongs_to_user(order_id: ObjectId, user_id: ObjectId) -> dict:
    """
    Ensure the order belongs to the given user.

    Args:
        order_id: Order ObjectId.
        user_id: User ObjectId.

    Returns:
        dict: order document.

    Raises:
        HTTPException 404 if not found for user.
    """
    doc = await db["orders"].find_one({"_id": order_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found for user")
    return doc


async def _get_exchange_status_id_by_label(label: str) -> ObjectId:
    """
    Resolve an exchange_status by its label (e.g., 'requested').

    Args:
        label: Status label.

    Returns:
        ObjectId: The status id.

    Raises:
        HTTPException 500 if not configured/present.
    """
    doc = await db["exchange_status"].find_one({"status": label})
    if not doc:
        raise HTTPException(status_code=500, detail=f"Exchange status '{label}' not found")
    return doc["_id"]


def _ensure_within_7_days(delivery_date: date) -> None:
    """
    Ensure the provided delivery_date is within the last 7 days inclusive.

    Args:
        delivery_date: Date of delivery.

    Raises:
        HTTPException 400 if exchange window has expired.
    """
    today = datetime.now(timezone.utc).date()
    delta_days = (today - delivery_date).days
    if delta_days < 0:
        # Future delivery date is invalid in this context
        raise HTTPException(status_code=400, detail="Delivery date cannot be in the future")
    if delta_days > 7:
        raise HTTPException(status_code=400, detail="Exchange window expired (delivery + 7 days)")


def _get_days_remaining(delivery_date: date) -> int:
    """Get days remaining for exchange window."""
    today = datetime.now(timezone.utc).date()
    days_since_delivery = (today - delivery_date).days
    return max(0, 7 - days_since_delivery)


# Standard clothing sizes
STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]


async def get_exchange_options_service(
    order_item_id: PyObjectId,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Get available exchange options for an order item.
    
    Returns:
        - can_exchange: bool (within 7-day window)
        - days_remaining: int
        - product: product details
        - available_sizes: list of available sizes
        - current_size: current size
        - current_quantity: current quantity
    """
    user_oid = _to_oid(current_user["user_id"], "user_id")
    
    # Load order item
    oi = await _get_order_item(order_item_id)
    order_id = oi["order_id"]
    product_id = oi["product_id"]
    current_size = oi.get("size", "")
    current_quantity = oi.get("quantity", 1)
    
    # Verify ownership
    order_doc = await _assert_order_belongs_to_user(order_id, user_oid)
    
    # Get delivery date
    delivery_date = order_doc.get("delivery_date")
    if not delivery_date:
        return {
            "can_exchange": False,
            "message": "Order does not have a delivery date",
            "days_remaining": 0,
            "product": None,
            "available_sizes": [],
            "current_size": current_size,
            "current_quantity": current_quantity,
        }
    
    # Parse delivery date
    if isinstance(delivery_date, str):
        try:
            delivery_date = datetime.fromisoformat(delivery_date).date()
        except Exception:
            return {"can_exchange": False, "message": "Invalid delivery date", "days_remaining": 0}
    elif isinstance(delivery_date, datetime):
        delivery_date = delivery_date.date()
    
    # Check if within exchange window
    today = datetime.now(timezone.utc).date()
    days_since_delivery = (today - delivery_date).days
    
    if days_since_delivery < 0:
        return {
            "can_exchange": False,
            "message": "Order has not been delivered yet",
            "days_remaining": 0,
            "product": None,
            "available_sizes": [],
            "current_size": current_size,
            "current_quantity": current_quantity,
        }
    
    days_remaining = max(0, 7 - days_since_delivery)
    can_exchange = days_remaining > 0
    
    # Get product details
    product = await db["products"].find_one(
        {"_id": product_id},
        {"name": 1, "description": 1, "price": 1, "total_price": 1, "thumbnail_url": 1, "quantity": 1, "out_of_stock": 1, "color": 1}
    )
    
    if not product:
        return {
            "can_exchange": False,
            "message": "Product not found",
            "days_remaining": days_remaining,
            "product": None,
            "available_sizes": [],
            "current_size": current_size,
            "current_quantity": current_quantity,
        }
    
    # Generate available sizes
    # Since products don't have size-specific inventory, show all standard sizes
    # with the product's general availability
    available_quantity = int(product.get("quantity", 0))
    is_out_of_stock = bool(product.get("out_of_stock", False))
    
    available_sizes = []
    for size in STANDARD_SIZES:
        available_sizes.append({
            "size": size,
            "available": not is_out_of_stock and available_quantity > 0,
            "is_current": size.upper() == str(current_size).upper(),
        })
    
    product_info = {
        "id": str(product["_id"]),
        "name": product.get("name", "Unknown"),
        "description": product.get("description", ""),
        "price": float(product.get("total_price", product.get("price", 0))),
        "thumbnail_url": product.get("thumbnail_url"),
        "color": product.get("color"),
        "available_quantity": available_quantity,
        "out_of_stock": is_out_of_stock,
    }
    
    message = None
    if not can_exchange:
        message = "Exchange window has expired (7 days after delivery)"
    elif is_out_of_stock:
        message = "Product is currently out of stock"
    
    return {
        "can_exchange": can_exchange and not is_out_of_stock,
        "message": message,
        "days_remaining": days_remaining,
        "product": product_info,
        "available_sizes": available_sizes,
        "current_size": current_size,
        "current_quantity": current_quantity,
        "order_item_id": str(order_item_id),
        "order_id": str(order_id),
    }


# -------------------- User services --------------------

async def create_exchange_service(
    order_item_id: PyObjectId,
    reason: Optional[str],
    image: UploadFile = None,
    new_quantity: int = 1,
    new_size: Optional[str] = None,
    current_user: Dict[str, Any] = None,
) -> ExchangesOut:
    """
    Create an exchange for a single order item.
    - delivery_date is automatically fetched from orders collection.
    - Enforces delivery_date within the last 7 days.
    """

    # Prepare user ObjectId
    user_oid = _to_oid(current_user["user_id"], "user_id")

    # 1) Load order_item → derive order_id + product_id
    oi = await _get_order_item(order_item_id)
    order_id = oi["order_id"]
    product_id = oi["product_id"]

    # 2) Ensure ownership
    order_doc = await _assert_order_belongs_to_user(order_id, user_oid)

    # ✅ 3) Read delivery_date from order document
    delivery_date = order_doc.get("delivery_date")
    if not delivery_date:
        raise HTTPException(
            status_code=400,
            detail="Order does not contain delivery_date; exchange cannot be created.",
        )

    # If stored as string, convert to date
    if isinstance(delivery_date, str):
        try:
            delivery_date = datetime.fromisoformat(delivery_date).date()
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="delivery_date in DB is not a valid ISO date format",
            )
    elif isinstance(delivery_date, datetime):
        delivery_date = delivery_date.date()
    elif not isinstance(delivery_date, date):
        raise HTTPException(
            status_code=500,
            detail="delivery_date format in DB is invalid",
        )

    # ✅ 4) Enforce 7-day rule
    _ensure_within_7_days(delivery_date)

    # 5) Resolve exchange_status = "approved" (default status per business rule)
    requested_status_id = await _get_exchange_status_id_by_label("approved")

    # 6) Handle image
    final_url: Optional[str] = None
    if image is not None:
        _, final_url = await upload_image(image)

    # 7) Get original size from order item
    original_size = oi.get("size")

    # 8) Build payload (now includes order_item_id and original_size)
    payload = ExchangesCreate(
        order_id=PyObjectId(str(order_id)),
        order_item_id=PyObjectId(str(order_item_id)),
        product_id=PyObjectId(str(product_id)),
        exchange_status_id=PyObjectId(str(requested_status_id)),
        user_id=PyObjectId(str(user_oid)),
        reason=reason,
        image_url=final_url,
        new_quantity=new_quantity,
        new_size=new_size,
        original_size=original_size,
    )

    try:
        # Update order_item status to "exchange_requested"
        await db["order_items"].update_one(
            {"_id": oi["_id"]},
            {"$set": {"item_status": "exchange_requested"}, "$currentDate": {"updatedAt": True}}
        )
        
        return await crud.create(payload)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create exchange: {e}")


async def list_my_exchanges_service(
    skip: int,
    limit: int,
    current_user: Dict[str, Any],
) -> List[ExchangesOut]:
    """
    List exchanges created by the current user.

    Args:
        skip: Offset.
        limit: Limit.
        current_user: Current user dict (expects 'user_id').

    Returns:
        List[ExchangesOut]
    """
    try:
        return await crud.list_all(
            skip=skip,
            limit=limit,
            query={"user_id": current_user["user_id"]},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list exchanges: {e}")


async def get_my_exchange_service(item_id: PyObjectId, current_user: Dict[str, Any]) -> ExchangesOut:
    """
    Get a single exchange that belongs to the current user.

    Args:
        item_id: Exchange ObjectId.
        current_user: Current user context.

    Returns:
        ExchangesOut

    Raises:
        403 if user does not own the exchange.
    """
    try:
        item = await crud.get_one(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Exchange not found")
        if str(item.user_id) != str(current_user["user_id"]):
            raise HTTPException(status_code=403, detail="Forbidden")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get exchange: {e}")


# -------------------- Admin services --------------------

async def admin_list_exchanges_service(
    skip: int,
    limit: int,
    user_id: Optional[PyObjectId],
    order_id: Optional[PyObjectId],
    product_id: Optional[PyObjectId],
    exchange_status_id: Optional[PyObjectId],
) -> List[ExchangesOut]:
    """
    Admin: list exchanges with optional filters.

    Args:
        skip, limit: Pagination controls.
        user_id, order_id, product_id, exchange_status_id: Optional filters.

    Returns:
        List[ExchangesOut]
    """
    try:
        q: Dict[str, Any] = {}
        if user_id: q["user_id"] = user_id
        if order_id: q["order_id"] = order_id
        if product_id: q["product_id"] = product_id
        if exchange_status_id: q["exchange_status_id"] = exchange_status_id
        return await crud.list_all(skip=skip, limit=limit, query=q or None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list exchanges: {e}")


async def admin_get_exchange_service(item_id: PyObjectId) -> ExchangesOut:
    """
    Admin: get a single exchange by ID.

    Args:
        item_id: Exchange ObjectId.

    Returns:
        ExchangesOut
    """
    try:
        item = await crud.get_one(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Exchange not found")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get exchange: {e}")


async def admin_update_exchange_status_service(item_id: PyObjectId, payload: ExchangesUpdate) -> ExchangesOut:
    """
    Admin: update only the exchange_status_id.
    
    When status changes to 'completed':
    - Updates the original order_item with the new size/quantity from exchange
    
    Note: No stock changes are needed since products don't have per-size inventory.
    The exchange is a 1-for-1 swap of the same product.

    Args:
        item_id: Exchange ObjectId.
        payload: ExchangesUpdate (expects exchange_status_id).

    Returns:
        ExchangesOut

    Raises:
        400 if exchange_status_id is missing.
    """
    try:
        if payload.exchange_status_id is None:
            raise HTTPException(status_code=400, detail="exchange_status_id is required")
        
        # Get the exchange document first
        exchange_doc = await db["exchanges"].find_one({"_id": _to_oid(item_id, "item_id")})
        if not exchange_doc:
            raise HTTPException(status_code=404, detail="Exchange not found")
        
        # Get the new status label
        new_status_doc = await db["exchange_status"].find_one(
            {"_id": _to_oid(payload.exchange_status_id, "exchange_status_id")}
        )
        if not new_status_doc:
            raise HTTPException(status_code=400, detail="Invalid exchange_status_id")
        
        new_status_label = new_status_doc.get("status", "").lower()
        
        # Get current status label to prevent double processing
        current_status_doc = await db["exchange_status"].find_one(
            {"_id": exchange_doc.get("exchange_status_id")}
        )
        current_status_label = current_status_doc.get("status", "").lower() if current_status_doc else ""
        
        # When status changes to 'completed', update the order_item with new size/quantity
        if new_status_label == "completed" and current_status_label != "completed":
            order_item_id = exchange_doc.get("order_item_id")
            new_size = exchange_doc.get("new_size")
            new_quantity = exchange_doc.get("new_quantity")
            
            if order_item_id:
                update_fields = {"updatedAt": datetime.now(timezone.utc), "item_status": "exchanged"}
                if new_size:
                    update_fields["size"] = new_size
                if new_quantity:
                    update_fields["quantity"] = new_quantity
                
                await db["order_items"].update_one(
                    {"_id": order_item_id},
                    {"$set": update_fields}
                )
        
        # Update order_item status to "exchange_rejected" when rejected
        if new_status_label == "rejected" and current_status_label != "rejected":
            order_item_id = exchange_doc.get("order_item_id")
            if order_item_id:
                await db["order_items"].update_one(
                    {"_id": order_item_id},
                    {"$set": {"item_status": "exchange_rejected"}, "$currentDate": {"updatedAt": True}}
                )
        
        updated = await crud.update_one(item_id, payload)
        if not updated:
            raise HTTPException(status_code=404, detail="Exchange not found or not updated")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update exchange: {e}")


async def admin_delete_exchange_service(item_id: PyObjectId):
    """
    Admin: delete an exchange and remove GridFS file if present.

    Args:
        item_id: Exchange ObjectId.

    Returns:
        JSONResponse({"deleted": True})
    """
    try:
        current = await crud.get_one(item_id)
        if not current:
            raise HTTPException(status_code=404, detail="Exchange not found")

        file_id = _extract_file_id_from_url(current.image_url)
        if file_id:
            await delete_image(file_id)

        ok = await crud.delete_one(item_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Exchange not found")
        return JSONResponse(status_code=200, content={"deleted": True})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete exchange: {e}")