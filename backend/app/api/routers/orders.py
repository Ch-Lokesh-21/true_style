"""
Routes for Orders.
- User endpoints (place, list, get, self-status update) enforce ownership.
- Admin endpoints can read/update/delete any order.
- New flow: initiate-order (for Razorpay) -> confirm-order OR place-order-cod (for COD)
- All heavy lifting is delegated to the service layer.
"""

from __future__ import annotations
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from datetime import date
from app.api.deps import require_permission, get_current_user
from app.schemas.object_id import PyObjectId
from app.schemas.orders import OrdersUpdate, OrdersOut
from app.services.orders import (
    initiate_order_service,
    confirm_order_service,
    place_order_cod_service,
    list_my_orders_service,
    get_my_order_service,
    update_my_order_status_service,
    admin_get_order_service,
    admin_list_orders_service,
    admin_update_order_service,
    admin_delete_order_service
)

router = APIRouter()


# --------------------------
# RAZORPAY FLOW
# --------------------------
@router.post(
    "/initiate-order",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_permission("orders", "Create"))],
)
async def initiate_order(
    address_id: PyObjectId,
    current_user: Dict = Depends(get_current_user),
):
    """
    Initiate an order for Razorpay payment.
    
    Steps:
    1. Validates cart items and stock availability
    2. Calculates total amount
    3. Creates a Razorpay order
    4. Returns Razorpay order details for frontend to process payment
    
    Returns:
        razorpay_order_id: str - Use this for Razorpay checkout
        amount: float - Total amount to pay
        key_id: str - Razorpay key for frontend
        address: dict - Delivery address
        cart_summary: dict - Cart items summary
    """
    return await initiate_order_service(
        address_id=address_id,
        current_user=current_user,
    )


@router.post(
    "/confirm-order",
    response_model=OrdersOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("orders", "Create"))],
)
async def confirm_order(
    address_id: PyObjectId,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    current_user: Dict = Depends(get_current_user),
):
    """
    Confirm order after Razorpay payment success.
    
    Steps:
    1. Verifies Razorpay payment signature
    2. Creates the order with razorpay_payment_id stored
    3. Moves cart items to order items
    4. Decrements product stock
    5. Sends confirmation email
    
    Args:
        address_id: Delivery address ID
        razorpay_order_id: From Razorpay checkout
        razorpay_payment_id: From Razorpay callback
        razorpay_signature: From Razorpay callback (for verification)
    
    Returns:
        OrdersOut: Created order details
    """
    return await confirm_order_service(
        address_id=address_id,
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        razorpay_signature=razorpay_signature,
        current_user=current_user,
    )


# --------------------------
# COD FLOW
# --------------------------
@router.post(
    "/place-order-cod",
    response_model=OrdersOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("orders", "Create"))],
)
async def place_order_cod(
    address_id: PyObjectId,
    current_user: Dict = Depends(get_current_user),
):
    """
    Place an order with Cash on Delivery (COD).
    
    Steps:
    1. Validates cart and stock availability
    2. Creates order with payment_method='cod'
    3. Moves cart items to order items
    4. Decrements product stock
    5. Sends confirmation email
    
    Returns:
        OrdersOut: Created order details
    """
    return await place_order_cod_service(
        address_id=address_id,
        current_user=current_user,
    )


@router.get(
    "/my",
    response_model=List[OrdersOut],
    dependencies=[Depends(require_permission("orders", "Read"))],
)
async def list_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: Dict = Depends(get_current_user),
):
    """List the current user's orders with pagination."""
    return await list_my_orders_service(skip=skip, limit=limit, current_user=current_user)


@router.get(
    "/my/{order_id}",
    response_model=OrdersOut,
    dependencies=[Depends(require_permission("orders", "Read"))],
)
async def get_my_order(order_id: PyObjectId, current_user: Dict = Depends(get_current_user)):
    """Get one order owned by the current user (ownership enforced)."""
    return await get_my_order_service(order_id=order_id, current_user=current_user)


@router.get(
    "/{order_id}",
    response_model=OrdersOut,
    dependencies=[Depends(require_permission("orders", "Read", "admin"))],
)
async def admin_get_order(order_id: PyObjectId):
    """Admin: get any order by id."""
    return await admin_get_order_service(order_id)

@router.get("/admin", response_model=List[OrdersOut], dependencies=[Depends(require_permission("orders","Read"))])
async def admin_list_orders(
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
):
    return await admin_list_orders_service(
        skip=skip, limit=limit,
        user_id=user_id, status_id=status_id,
        created_from=created_from, created_to=created_to,
        delivery_from=delivery_from, delivery_to=delivery_to,
        min_total=min_total, max_total=max_total,
        q=q, sort=sort,
    )


@router.put(
    "/my/{order_id}/status",
    response_model=OrdersOut,
    dependencies=[Depends(require_permission("orders", "Update"))],
)
async def update_my_order_status(
    order_id: PyObjectId,
    payload: OrdersUpdate,
    current_user: Dict = Depends(get_current_user),
):
    """
    User updates their own order status (if allowed by business policy).

    Requires:
        payload.status_id not None
    """
    return await update_my_order_status_service(order_id=order_id, payload=payload, current_user=current_user)


@router.put(
    "/{order_id}",
    response_model=OrdersOut,
    dependencies=[Depends(require_permission("orders", "Update", "admin"))],
)
async def admin_update_order_(order_id: PyObjectId, payload: OrdersUpdate):
    """
    Admin: update `status_id`. Special handling:
      - If status is 'out for delivery' → generate and set a 6-digit OTP.
      - If status is 'delivered' → clear OTP.
    """
    return await admin_update_order_service(order_id=order_id, payload=payload)


@router.delete(
    "/{order_id}",
    dependencies=[Depends(require_permission("orders", "Delete"))],
)
async def admin_delete_order(order_id: PyObjectId):
    """
    Admin: transactionally delete one order and related documents:
      - order_items
      - payments
      - upi_details / card_details
    """
    return await admin_delete_order_service(order_id)