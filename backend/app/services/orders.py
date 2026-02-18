"""
Service layer for Orders.
- New simplified payment flow: COD or Razorpay only
- Email notifications on order creation and status changes
- Encapsulates all business logic: stock checks, payments, ownership checks,
  and transactional writes.
"""

from __future__ import annotations
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timezone, date, time, timedelta
import re
import secrets
from bson import ObjectId
from pymongo import ReturnDocument, ASCENDING, DESCENDING
from fastapi import HTTPException
from fastapi.responses import JSONResponse

from app.core.database import db
from app.utils.mongo import stamp_create, stamp_update
from app.schemas.object_id import PyObjectId
from app.schemas.orders import OrdersCreate, OrdersUpdate, OrdersOut
from app.crud import orders as orders_crud
from app.services.razorpay import create_razorpay_order, verify_razorpay_signature
from app.services.order_emails import (
    send_order_confirmation_email,
    send_order_status_update_email,
    send_delivery_date_change_email,
)


# ----------------- helpers -----------------

def _to_oid(v: Any, field: str) -> ObjectId:
    try:
        return ObjectId(str(v))
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {field}")


async def _get_order_with_status(order_id: ObjectId) -> Optional[OrdersOut]:
    """
    Get an order with the status name populated using aggregation.
    """
    pipeline = [
        {"$match": {"_id": order_id}},
        {"$lookup": {
            "from": "order_status",
            "localField": "status_id",
            "foreignField": "_id",
            "as": "_status_doc"
        }},
        {"$addFields": {
            "status": {"$arrayElemAt": ["$_status_doc.status", 0]}
        }},
        {"$project": {"_status_doc": 0}}
    ]
    docs = await db["orders"].aggregate(pipeline).to_list(length=1)
    return OrdersOut.model_validate(docs[0]) if docs else None


async def _get_address_for_user(address_id: PyObjectId, user_id: PyObjectId) -> dict:
    addr = await db["user_address"].find_one(
        {"_id": ObjectId(str(address_id)), "user_id": ObjectId(str(user_id))}
    )
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    return addr


async def _get_cart_and_items_for_user(user_id: ObjectId) -> Tuple[dict, list]:
    cart = await db["carts"].find_one({"user_id": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    items = await db["cart_items"].find({"cart_id": cart["_id"]}).to_list(length=None)
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    return cart, items


def _gen_otp(n: int = 6) -> str:
    """Return a cryptographically-strong zero-padded numeric OTP of length n."""
    return str(secrets.randbelow(10**n)).zfill(n)


async def _get_status_doc_by_id(status_id: PyObjectId) -> dict:
    doc = await db["order_status"].find_one({"_id": ObjectId(str(status_id))})
    if not doc:
        raise HTTPException(status_code=400, detail="Unknown order status")
    return doc


async def _get_status_id(slug: str) -> ObjectId:
    doc = await db["order_status"].find_one({"status": slug}, {"_id": 1})
    if not doc:
        raise HTTPException(status_code=500, detail=f"Order status '{slug}' is not seeded")
    return doc["_id"]


async def _get_user_details(user_id: ObjectId) -> dict:
    """Get user details for email notifications."""
    user = await db["users"].find_one({"_id": user_id}, {"email": 1, "first_name": 1, "last_name": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def _get_product_details_for_items(items: list) -> List[Dict[str, Any]]:
    """Get product details for order items (for email)."""
    product_ids = [item["product_id"] for item in items]
    products = await db["products"].find(
        {"_id": {"$in": product_ids}},
        {"name": 1, "total_price": 1, "price": 1}
    ).to_list(length=None)
    
    product_map = {str(p["_id"]): p for p in products}
    
    result = []
    for item in items:
        prod = product_map.get(str(item["product_id"]), {})
        result.append({
            "name": prod.get("name", "Unknown Product"),
            "size": item.get("size", "-"),
            "quantity": item.get("quantity", 1),
            "price": float(prod.get("total_price", prod.get("price", 0)))
        })
    return result


# ----------------- Initiate Order (Razorpay) -----------------

async def initiate_order_service(
    address_id: PyObjectId,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Initiate order for Razorpay payment.
    - Validates cart items and stock
    - Calculates total
    - Creates Razorpay order
    - Returns details for frontend checkout
    """
    user_id = current_user["user_id"]
    user_oid = _to_oid(user_id, "user_id")
    
    # Get address
    addr_doc = await _get_address_for_user(address_id, user_id)
    order_address = {
        "mobile_no": addr_doc["mobile_no"],
        "postal_code": addr_doc["postal_code"],
        "country": addr_doc["country"],
        "state": addr_doc["state"],
        "city": addr_doc["city"],
        "address": addr_doc["address"],
    }
    
    # Get cart items
    cart, items = await _get_cart_and_items_for_user(user_oid)
    
    # Calculate total and check availability
    order_total = 0.0
    cart_summary = []
    
    for it in items:
        pid: ObjectId = it["product_id"]
        qty: int = int(it.get("quantity", 1))
        
        prod = await db["products"].find_one(
            {"_id": pid},
            {"price": 1, "total_price": 1, "quantity": 1, "out_of_stock": 1, "name": 1}
        )
        
        if not prod:
            raise HTTPException(status_code=400, detail=f"Product not found in cart")
        
        available = int(prod.get("quantity", 0))
        if available < qty or prod.get("out_of_stock", False):
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{prod.get('name', 'product')}'. Available: {available}, Requested: {qty}"
            )
        
        price = float(prod.get("total_price", prod.get("price", 0.0)))
        order_total += price * qty
        
        cart_summary.append({
            "product_id": str(pid),
            "name": prod.get("name", "Unknown"),
            "quantity": qty,
            "size": it.get("size", "-"),
            "price": price,
            "subtotal": round(price * qty, 2)
        })
    
    order_total = round(order_total, 2)
    
    # Create Razorpay order (receipt must be <= 40 chars)
    user_id_short = str(user_id)[-8:]  # Last 8 chars of user_id
    timestamp_short = int(datetime.now(timezone.utc).timestamp())
    receipt = f"ord_{user_id_short}_{timestamp_short}"
    
    razorpay_order = await create_razorpay_order(
        amount=order_total,
        currency="INR",
        receipt=receipt
    )
    
    return {
        "razorpay_order_id": razorpay_order["razorpay_order_id"],
        "amount": order_total,
        "amount_in_paise": razorpay_order["amount_in_paise"],
        "currency": "INR",
        "key_id": razorpay_order["key_id"],
        "address": order_address,
        "cart_summary": cart_summary,
        "total_items": len(items)
    }


# ----------------- Confirm Order (After Razorpay Payment) -----------------

async def confirm_order_service(
    address_id: PyObjectId,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    current_user: Dict[str, Any],
) -> OrdersOut:
    """
    Confirm order after successful Razorpay payment.
    """
    # Verify Razorpay signature
    verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    
    user_id = current_user["user_id"]
    user_oid = _to_oid(user_id, "user_id")
    
    # Get address
    addr_doc = await _get_address_for_user(address_id, user_id)
    order_address = {
        "mobile_no": addr_doc["mobile_no"],
        "postal_code": addr_doc["postal_code"],
        "country": addr_doc["country"],
        "state": addr_doc["state"],
        "city": addr_doc["city"],
        "address": addr_doc["address"],
    }
    
    # Get user for email
    user = await _get_user_details(user_oid)
    user_email = user.get("email", "")
    user_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or "Customer"
    
    # Get cart items
    cart, items = await _get_cart_and_items_for_user(user_oid)
    
    # Get order status "confirmed"
    order_status_doc = await db["order_status"].find_one({"status": "confirmed"})
    if not order_status_doc:
        raise HTTPException(status_code=500, detail="Order status 'confirmed' not found")
    
    session = await db.client.start_session()
    try:
        async with session.start_transaction():
            order_total = 0.0
            now = datetime.now(timezone.utc)
            
            # Check & decrement stock; compute totals
            for it in items:
                pid: ObjectId = it["product_id"]
                qty: int = int(it.get("quantity", 1))
                
                prod_after = await db["products"].find_one_and_update(
                    {"_id": pid, "quantity": {"$gte": qty}},
                    {"$inc": {"quantity": -qty}, "$currentDate": {"updatedAt": True}},
                    session=session,
                    return_document=ReturnDocument.AFTER,
                    projection={"price": 1, "total_price": 1, "quantity": 1, "out_of_stock": 1},
                )
                if not prod_after:
                    raise HTTPException(status_code=400, detail="Insufficient stock for a product in your cart")
                
                if int(prod_after.get("quantity", 0)) == 0 and not bool(prod_after.get("out_of_stock", False)):
                    await db["products"].update_one(
                        {"_id": pid, "out_of_stock": {"$ne": True}},
                        {"$set": {"out_of_stock": True}, "$currentDate": {"updatedAt": True}},
                        session=session,
                    )
                
                price = float(prod_after.get("total_price", prod_after.get("price", 0.0)))
                order_total += price * qty
            
            order_total = round(order_total, 2)
            delivery_date = (date.today() + timedelta(days=3))
            
            # Create order
            order_payload = OrdersCreate(
                user_id=user_id,
                address=order_address,
                status_id=order_status_doc["_id"],
                total=order_total,
                delivery_date=delivery_date,
                delivery_otp=None,
                payment_method="razorpay",
                razorpay_payment_id=razorpay_payment_id,
            )
            order_doc = stamp_create(order_payload.model_dump(mode="python"))
            if isinstance(order_doc.get("delivery_date"), date):
                order_doc["delivery_date"] = datetime.combine(order_doc["delivery_date"], datetime.min.time())
            order_res = await db["orders"].insert_one(order_doc, session=session)
            order_id = order_res.inserted_id
            
            # Move cart_items → order_items
            oi_bulk = [
                {
                    "order_id": order_id,
                    "product_id": it["product_id"],
                    "quantity": it.get("quantity", 1),
                    "size": it.get("size"),
                    "user_id": user_oid,
                    "item_status": "ordered",
                    "createdAt": now,
                    "updatedAt": now,
                }
                for it in items
            ]
            if oi_bulk:
                await db["order_items"].insert_many(oi_bulk, session=session)
            
            # Clear cart items
            await db["cart_items"].delete_many({"cart_id": cart["_id"]}, session=session)
        
        # Get product details for email
        order_items_for_email = await _get_product_details_for_items(items)
        
        # Send confirmation email (non-blocking)
        try:
            await send_order_confirmation_email(
                user_email=user_email,
                user_name=user_name,
                order_id=str(order_id),
                order_items=order_items_for_email,
                total_amount=order_total,
                delivery_date=delivery_date,
                address=order_address,
                payment_method="Razorpay (Paid)"
            )
        except Exception as email_err:
            # Log but don't fail the order
            print(f"Failed to send order confirmation email: {email_err}")
        
        # Return saved order with status name
        return await _get_order_with_status(order_id)
    
    except HTTPException:
        raise
    except Exception as e:
        try:
            await session.abort_transaction()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to confirm order: {e}")
    finally:
        try:
            await session.end_session()
        except Exception:
            pass


# ----------------- COD Order -----------------

async def place_order_cod_service(
    address_id: PyObjectId,
    current_user: Dict[str, Any],
) -> OrdersOut:
    """
    Create an order with Cash on Delivery.
    """
    user_id = current_user["user_id"]
    user_oid = _to_oid(user_id, "user_id")
    
    # Get address
    addr_doc = await _get_address_for_user(address_id, user_id)
    order_address = {
        "mobile_no": addr_doc["mobile_no"],
        "postal_code": addr_doc["postal_code"],
        "country": addr_doc["country"],
        "state": addr_doc["state"],
        "city": addr_doc["city"],
        "address": addr_doc["address"],
    }
    
    # Get user for email
    user = await _get_user_details(user_oid)
    user_email = user.get("email", "")
    user_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or "Customer"
    
    # Get cart items
    cart, items = await _get_cart_and_items_for_user(user_oid)
    
    # Get order status "confirmed"
    order_status_doc = await db["order_status"].find_one({"status": "confirmed"})
    if not order_status_doc:
        raise HTTPException(status_code=500, detail="Order status 'confirmed' not found")
    
    session = await db.client.start_session()
    try:
        async with session.start_transaction():
            order_total = 0.0
            now = datetime.now(timezone.utc)
            
            # Check & decrement stock; compute totals
            for it in items:
                pid: ObjectId = it["product_id"]
                qty: int = int(it.get("quantity", 1))
                
                prod_after = await db["products"].find_one_and_update(
                    {"_id": pid, "quantity": {"$gte": qty}},
                    {"$inc": {"quantity": -qty}, "$currentDate": {"updatedAt": True}},
                    session=session,
                    return_document=ReturnDocument.AFTER,
                    projection={"price": 1, "total_price": 1, "quantity": 1, "out_of_stock": 1},
                )
                if not prod_after:
                    raise HTTPException(status_code=400, detail="Insufficient stock for a product in your cart")
                
                if int(prod_after.get("quantity", 0)) == 0 and not bool(prod_after.get("out_of_stock", False)):
                    await db["products"].update_one(
                        {"_id": pid, "out_of_stock": {"$ne": True}},
                        {"$set": {"out_of_stock": True}, "$currentDate": {"updatedAt": True}},
                        session=session,
                    )
                
                price = float(prod_after.get("total_price", prod_after.get("price", 0.0)))
                order_total += price * qty
            
            order_total = round(order_total, 2)
            delivery_date = (date.today() + timedelta(days=3))
            
            # Create order
            order_payload = OrdersCreate(
                user_id=user_id,
                address=order_address,
                status_id=order_status_doc["_id"],
                total=order_total,
                delivery_date=delivery_date,
                delivery_otp=None,
                payment_method="cod",
                razorpay_payment_id=None,
            )
            order_doc = stamp_create(order_payload.model_dump(mode="python"))
            if isinstance(order_doc.get("delivery_date"), date):
                order_doc["delivery_date"] = datetime.combine(order_doc["delivery_date"], datetime.min.time())
            order_res = await db["orders"].insert_one(order_doc, session=session)
            order_id = order_res.inserted_id
            
            # Move cart_items → order_items
            oi_bulk = [
                {
                    "order_id": order_id,
                    "product_id": it["product_id"],
                    "quantity": it.get("quantity", 1),
                    "size": it.get("size"),
                    "user_id": user_oid,
                    "item_status": "ordered",
                    "createdAt": now,
                    "updatedAt": now,
                }
                for it in items
            ]
            if oi_bulk:
                await db["order_items"].insert_many(oi_bulk, session=session)
            
            # Clear cart items
            await db["cart_items"].delete_many({"cart_id": cart["_id"]}, session=session)
        
        # Get product details for email
        order_items_for_email = await _get_product_details_for_items(items)
        
        # Send confirmation email (non-blocking)
        try:
            await send_order_confirmation_email(
                user_email=user_email,
                user_name=user_name,
                order_id=str(order_id),
                order_items=order_items_for_email,
                total_amount=order_total,
                delivery_date=delivery_date,
                address=order_address,
                payment_method="Cash on Delivery"
            )
        except Exception as email_err:
            print(f"Failed to send order confirmation email: {email_err}")
        
        # Return saved order with status name
        return await _get_order_with_status(order_id)
    
    except HTTPException:
        raise
    except Exception as e:
        try:
            await session.abort_transaction()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to place order: {e}")
    finally:
        try:
            await session.end_session()
        except Exception:
            pass


# ----------------- List/Get Orders -----------------

async def list_my_orders_service(skip: int, limit: int, current_user: Dict[str, Any]) -> List[OrdersOut]:
    """List the current user's orders with pagination."""
    try:
        user_oid = ObjectId(str(current_user["user_id"]))
        return await orders_crud.list_all(skip=skip, limit=limit, query={"user_id": user_oid})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list orders: {e}")


async def get_my_order_service(order_id: PyObjectId, current_user: Dict[str, Any]) -> OrdersOut:
    """Get one order with ownership enforcement."""
    try:
        order = await orders_crud.get_one(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if str(order.user_id) != str(current_user["user_id"]):
            raise HTTPException(status_code=403, detail="Forbidden")
        return order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get order: {e}")


async def admin_get_order_service(order_id: PyObjectId) -> OrdersOut:
    """Admin: get any order by id."""
    try:
        order = await orders_crud.get_one(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get order: {e}")


# ----------------- Update Order Status -----------------

async def update_my_order_status_service(
    order_id: PyObjectId,
    payload: OrdersUpdate,
    current_user: Dict[str, Any],
) -> OrdersOut:
    """
    User can cancel their own order only when the current status is one of:
    'placed', 'confirmed', 'packed'. Target status is forced to 'cancelled'.
    """
    try:
        user_id = ObjectId(str(current_user["user_id"]))
        
        PLACED_ID = await _get_status_id("placed")
        CONFIRMED_ID = await _get_status_id("confirmed")
        PACKED_ID = await _get_status_id("packed")
        CANCELLED_ID = await _get_status_id("cancelled")
        
        allowed_current = [PLACED_ID, CONFIRMED_ID, PACKED_ID]
        
        updated_doc = await db["orders"].find_one_and_update(
            {
                "_id": ObjectId(str(order_id)),
                "user_id": user_id,
                "status_id": {"$in": allowed_current},
            },
            {
                "$set": {
                    "status_id": CANCELLED_ID,
                    "updatedAt": datetime.now(timezone.utc),
                }
            },
            return_document=ReturnDocument.AFTER,
        )
        
        if not updated_doc:
            order = await db["orders"].find_one({"_id": ObjectId(str(order_id))}, {"user_id": 1, "status_id": 1})
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            if str(order["user_id"]) != str(user_id):
                raise HTTPException(status_code=403, detail="Forbidden")
            raise HTTPException(
                status_code=409,
                detail="Order cannot be cancelled at its current status",
            )
        
        return await _get_order_with_status(updated_doc["_id"])
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update order: {e}")


# ----------------- Admin Update Order -----------------

def _start_of_day(d: date) -> datetime:
    return datetime.combine(d, time.min).replace(tzinfo=timezone.utc)

def _end_of_day(d: date) -> datetime:
    return datetime.combine(d, time.max).replace(tzinfo=timezone.utc)


async def admin_list_orders_service(
    *,
    skip: int = 0,
    limit: int = 20,
    user_id: Optional[PyObjectId] = None,
    status_id: Optional[PyObjectId] = None,
    created_from: Optional[date] = None,
    created_to: Optional[date] = None,
    delivery_from: Optional[date] = None,
    delivery_to: Optional[date] = None,
    min_total: Optional[float] = None,
    max_total: Optional[float] = None,
    q: Optional[str] = None,
    sort: Optional[str] = "-createdAt",
) -> List[OrdersOut]:
    """Admin: list orders with rich, optional filters."""
    try:
        query: Dict[str, Any] = {}
        
        if user_id:
            query["user_id"] = ObjectId(str(user_id))
        if status_id:
            query["status_id"] = ObjectId(str(status_id))
        
        if created_from or created_to:
            query["createdAt"] = {}
            if created_from:
                query["createdAt"]["$gte"] = _start_of_day(created_from)
            if created_to:
                query["createdAt"]["$lte"] = _end_of_day(created_to)
        
        if delivery_from or delivery_to:
            query["delivery_date"] = {}
            if delivery_from:
                query["delivery_date"]["$gte"] = _start_of_day(delivery_from)
            if delivery_to:
                query["delivery_date"]["$lte"] = _end_of_day(delivery_to)
        
        if min_total is not None or max_total is not None:
            query["total"] = {}
            if min_total is not None:
                query["total"]["$gte"] = float(min_total)
            if max_total is not None:
                query["total"]["$lte"] = float(max_total)
        
        if q:
            rx = {"$regex": q.strip(), "$options": "i"}
            query["$or"] = [
                {"invoice_no": rx},
                {"address.mobile_no": rx},
            ]
        
        sort_field = "createdAt"
        sort_dir = DESCENDING
        if sort:
            if sort.startswith("-"):
                sort_field = sort[1:] or "createdAt"
                sort_dir = DESCENDING
            else:
                sort_field = sort
                sort_dir = ASCENDING
        
        # Use aggregation to include status name
        pipeline = [
            {"$match": query},
            {"$sort": {sort_field: sort_dir}},
            {"$skip": max(0, int(skip))},
            {"$limit": max(1, int(limit))},
            {"$lookup": {
                "from": "order_status",
                "localField": "status_id",
                "foreignField": "_id",
                "as": "_status_doc"
            }},
            {"$addFields": {
                "status": {"$arrayElemAt": ["$_status_doc.status", 0]}
            }},
            {"$project": {"_status_doc": 0}}
        ]
        docs = await db["orders"].aggregate(pipeline).to_list(length=None)
        
        for d in docs:
            if isinstance(d.get("delivery_date"), datetime):
                d["delivery_date"] = d["delivery_date"].date()
        
        return [OrdersOut.model_validate(d) for d in docs]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list orders: {e}")


async def admin_update_order_service(order_id: PyObjectId, payload: OrdersUpdate) -> OrdersOut:
    """
    Admin: update order status_id and/or delivery_date.
    - If new status is 'out for delivery' → generate OTP and store it.
    - If new status is 'delivered' → clear OTP.
    - Sends email notification on status/date changes.
    """
    try:
        # Get current order
        current_order = await db["orders"].find_one({"_id": ObjectId(str(order_id))})
        if not current_order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        updates: Dict[str, Any] = {}
        status_changed = False
        delivery_date_changed = False
        old_delivery_date = None
        new_status_name = None
        
        if payload.status_id is not None:
            sdoc = await _get_status_doc_by_id(payload.status_id)
            sname = str(sdoc.get("status", "")).strip().lower()
            new_status_name = sdoc.get("status", "Unknown")
            updates["status_id"] = sdoc["_id"]
            
            if sname in {"out for delivery", "out_for_delivery", "out-for-delivery"}:
                updates["delivery_otp"] = _gen_otp(6)
            elif sname in {"delivered"}:
                updates["delivery_otp"] = None
            
            if str(current_order.get("status_id")) != str(sdoc["_id"]):
                status_changed = True
        
        if payload.delivery_date is not None:
            old_dd = current_order.get("delivery_date")
            if isinstance(old_dd, datetime):
                old_delivery_date = old_dd.date()
            elif isinstance(old_dd, date):
                old_delivery_date = old_dd
            
            new_dd = payload.delivery_date
            if old_delivery_date != new_dd:
                delivery_date_changed = True
                updates["delivery_date"] = datetime.combine(new_dd, datetime.min.time(), tzinfo=timezone.utc)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")
        
        updated_doc = await db["orders"].find_one_and_update(
            {"_id": ObjectId(str(order_id))},
            {"$set": stamp_update(updates)},
            return_document=ReturnDocument.AFTER,
        )
        
        if not updated_doc:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Send email notifications
        try:
            user_oid = updated_doc["user_id"]
            user = await _get_user_details(user_oid)
            user_email = user.get("email", "")
            user_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or "Customer"
            
            # Get delivery date for email
            dd = updated_doc.get("delivery_date")
            if isinstance(dd, datetime):
                dd = dd.date()
            
            if status_changed and new_status_name:
                await send_order_status_update_email(
                    user_email=user_email,
                    user_name=user_name,
                    order_id=str(order_id),
                    new_status=new_status_name,
                    delivery_date=dd,
                    delivery_otp=updates.get("delivery_otp")
                )
            
            if delivery_date_changed and old_delivery_date and payload.delivery_date:
                await send_delivery_date_change_email(
                    user_email=user_email,
                    user_name=user_name,
                    order_id=str(order_id),
                    old_date=old_delivery_date,
                    new_date=payload.delivery_date
                )
        except Exception as email_err:
            print(f"Failed to send order update email: {email_err}")
        
        return await _get_order_with_status(updated_doc["_id"])
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update order: {e}")


async def admin_delete_order_service(order_id: PyObjectId):
    """Admin: transactionally delete one order and related documents."""
    try:
        result = await orders_crud.delete_one_cascade(order_id)
        if result is None or result.get("status") == "not_found":
            raise HTTPException(status_code=404, detail="Order not found")
        if result.get("status") != "deleted":
            raise HTTPException(status_code=500, detail="Failed to delete order")
        return JSONResponse(status_code=200, content=result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete order: {e}")
