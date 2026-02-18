from __future__ import annotations
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from fastapi import HTTPException
from fastapi.responses import JSONResponse
from bson import ObjectId

from app.core.database import db
from app.schemas.object_id import PyObjectId
from app.schemas.cart_items import CartItemsCreate, CartItemsUpdate, CartItemsOut
from app.crud import cart_items as crud


async def create_item_service(
    product_id: PyObjectId,
    size: str,
    quantity: Optional[int],
    current_user: Dict[str, Any],
) -> CartItemsOut:
    payload = CartItemsCreate(
        cart_id=current_user["cart_id"],  # PyObjectId schema will coerce if this is a str
        product_id=product_id,
        size=size,
        quantity=quantity,
    )
    try:
        return await crud.create(payload)
    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        if "E11000" in msg:
            raise HTTPException(status_code=409, detail="Duplicate cart item")
        raise HTTPException(status_code=500, detail=f"Failed to create cart item: {e}")


async def list_items_service(
    skip: int,
    limit: int,
    product_id: Optional[PyObjectId],
    current_user: Dict[str, Any],
) -> List[CartItemsOut]:
    try:
        q: Dict[str, Any] = {"cart_id": PyObjectId(current_user["cart_id"])}
        if product_id:
            q["product_id"] = product_id  # crud will normalize to ObjectId if valid
        return await crud.list_all(skip=skip, limit=limit, query=q)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list cart items: {e}")


async def get_item_service(item_id: PyObjectId, current_user: Dict[str, Any]) -> CartItemsOut:
    try:
        item = await crud.get_one(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        user_cart_id = str(current_user.get("cart_id", ""))
        if not user_cart_id:
            raise HTTPException(status_code=400, detail="Missing cart_id in current user")

        if str(item.cart_id) != user_cart_id:
            raise HTTPException(status_code=403, detail="Forbidden")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cart item: {e}")


async def update_item_service(
    item_id: PyObjectId,
    payload: CartItemsUpdate,
    current_user: Dict[str, Any],
) -> CartItemsOut:
    try:
        item = await crud.get_one(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        user_cart_id = str(current_user.get("cart_id", ""))
        if not user_cart_id:
            raise HTTPException(status_code=400, detail="Missing cart_id in current user")
        if str(item.cart_id) != user_cart_id:
            raise HTTPException(status_code=403, detail="Forbidden")

        if not any(v is not None for v in payload.model_dump().values()):
            raise HTTPException(status_code=400, detail="No fields provided for update")

        updated = await crud.update_one(item_id, payload)
        if not updated:
            raise HTTPException(status_code=404, detail="Cart item not found or not updated")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        if "E11000" in msg:
            raise HTTPException(status_code=409, detail="Duplicate cart item")
        raise HTTPException(status_code=500, detail=f"Failed to update cart item: {e}")


async def delete_item_service(item_id: PyObjectId, current_user: Dict[str, Any]):
    try:
        item = await crud.get_one(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        user_cart_id = str(current_user.get("cart_id", ""))
        if not user_cart_id:
            raise HTTPException(status_code=400, detail="Missing cart_id in current user")
        if str(item.cart_id) != user_cart_id:
            raise HTTPException(status_code=403, detail="Forbidden")

        ok = await crud.delete_one(item_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Cart item not found")
        return JSONResponse(status_code=200, content={"deleted": True})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete cart item: {e}")


# ----------------------------
# Check Cart Availability
# ----------------------------
async def check_cart_availability_service(current_user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Check the availability of all products in the user's cart.
    
    Returns:
        Dict containing:
        - all_available: bool (true if all items have sufficient stock)
        - total_items: int
        - total_quantity: int
        - total_amount: float
        - items: List of item availability details
    """
    try:
        cart_id = current_user.get("cart_id")
        if not cart_id:
            raise HTTPException(status_code=400, detail="Missing cart_id in current user")
        
        cart_oid = ObjectId(str(cart_id))
        
        # Get all cart items
        cart_items = await db["cart_items"].find({"cart_id": cart_oid}).to_list(length=None)
        
        if not cart_items:
            return {
                "all_available": True,
                "total_items": 0,
                "total_quantity": 0,
                "total_amount": 0.0,
                "items": []
            }
        
        # Check each item's availability
        items_status = []
        all_available = True
        total_amount = 0.0
        total_quantity = 0
        
        for item in cart_items:
            product_id = item["product_id"]
            requested_qty = int(item.get("quantity", 1))
            size = item.get("size", "")
            
            # Fetch product details
            product = await db["products"].find_one(
                {"_id": product_id},
                {"name": 1, "quantity": 1, "out_of_stock": 1, "price": 1, "total_price": 1, "thumbnail_url": 1}
            )
            
            if not product:
                items_status.append({
                    "cart_item_id": str(item["_id"]),
                    "product_id": str(product_id),
                    "product_name": "Product not found",
                    "size": size,
                    "requested_quantity": requested_qty,
                    "available_quantity": 0,
                    "available": False,
                    "out_of_stock": True,
                    "price": 0,
                    "subtotal": 0,
                    "thumbnail_url": None,
                    "message": "Product no longer exists"
                })
                all_available = False
                continue
            
            available_qty = int(product.get("quantity", 0))
            is_out_of_stock = bool(product.get("out_of_stock", False))
            is_available = available_qty >= requested_qty and not is_out_of_stock
            
            price = float(product.get("total_price", product.get("price", 0)))
            subtotal = price * requested_qty
            
            if is_available:
                total_amount += subtotal
                total_quantity += requested_qty
            else:
                all_available = False
            
            message = None
            if is_out_of_stock:
                message = "Product is out of stock"
            elif available_qty < requested_qty:
                message = f"Only {available_qty} available (requested {requested_qty})"
            
            items_status.append({
                "cart_item_id": str(item["_id"]),
                "product_id": str(product_id),
                "product_name": product.get("name", "Unknown"),
                "size": size,
                "requested_quantity": requested_qty,
                "available_quantity": available_qty,
                "available": is_available,
                "out_of_stock": is_out_of_stock,
                "price": price,
                "subtotal": subtotal if is_available else 0,
                "thumbnail_url": product.get("thumbnail_url"),
                "message": message
            })
        
        return {
            "all_available": all_available,
            "total_items": len(cart_items),
            "total_quantity": total_quantity,
            "total_amount": round(total_amount, 2),
            "items": items_status
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check cart availability: {e}")


# ----------------------------
# Transactional: Move to Wishlist
# ----------------------------
async def move_to_wishlist_service(item_id: PyObjectId, current_user: Dict[str, Any]) -> CartItemsOut:
    """
    Moves a cart line into wishlist_items atomically:
      - Upsert wishlist_items by (wishlist_id, product_id)
      - Delete the cart line
    Assumptions:
      - current_user contains "wishlist_id"
      - wishlist_items schema stores wishlist_id & product_id as ObjectId
    """
    # Ensure user owns the cart item
    cart_doc = await db["cart_items"].find_one({"_id": item_id})
    if not cart_doc:
        raise HTTPException(status_code=404, detail="Cart item not found")

    user_cart_id = current_user.get("cart_id", "")
    if not user_cart_id:
        raise HTTPException(status_code=400, detail="Missing cart_id in current user")
    if str(cart_doc["cart_id"]) != str(user_cart_id):
        raise HTTPException(status_code=403, detail="Forbidden")

    # Prepare ObjectIds for wishlist upsert
    product_oid = (
        cart_doc["product_id"]
        if isinstance(cart_doc.get("product_id"), ObjectId)
        else ObjectId(str(cart_doc["product_id"]))
    )
    wishlist_id_val = current_user.get("wishlist_id")
    try:
        wishlist_oid = wishlist_id_val if isinstance(wishlist_id_val, ObjectId) else ObjectId(str(wishlist_id_val))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid wishlist_id in current user")

    try:
        async with await db.client.start_session() as session:
            async with session.start_transaction():
                # Upsert wishlist item (ObjectId FKs)
                f = {"wishlist_id": wishlist_oid, "product_id": product_oid}
                await db["wishlist_items"].update_one(
                    f,
                    {
                        "$setOnInsert": {
                            "wishlist_id": wishlist_oid,
                            "product_id": product_oid,
                            "createdAt": datetime.now(timezone.utc),
                        },
                        "$currentDate": {"updatedAt": True},
                    },
                    upsert=True,
                    session=session,
                )

                # Delete the cart line
                del_res = await db["cart_items"].delete_one({"_id": item_id}, session=session)
                if del_res.deleted_count != 1:
                    raise HTTPException(status_code=400, detail="Unable to move to wishlist")

        # committed — return the deleted cart snapshot
        return CartItemsOut.model_validate(cart_doc)

    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        if "E11000" in msg:
            # unique index on (wishlist_id, product_id) may surface this from other writers
            raise HTTPException(status_code=409, detail="Duplicate wishlist item")
        raise HTTPException(status_code=500, detail=f"Failed to move to wishlist: {e}")