# app/schemas/order_items.py
from typing import Optional, Annotated, Literal
from datetime import datetime

from pydantic import BaseModel, Field, field_validator
from app.schemas.object_id import PyObjectId

Qty = Annotated[int, Field(ge=1, le=1_000_000, description="Quantity must be ≥ 1")]
Size = Annotated[str, Field(min_length=1, max_length=50, description="Size label (e.g., S, M, L, 42)")]

# Item-level status enum (not a MongoDB collection)
ItemStatus = Literal[
    "ordered",            # Initial state when order is placed
    "return_requested",   # User requested a return
    "returned",           # Return completed/refunded
    "return_rejected",    # Return request was rejected
    "exchange_requested", # User requested an exchange
    "exchanged",          # Exchange completed
    "exchange_rejected",  # Exchange request was rejected
]


class OrderItemsBase(BaseModel):
    order_id: PyObjectId
    user_id: PyObjectId
    product_id: PyObjectId
    quantity: Optional[Qty] = None
    size: Optional[Size] = None
    item_status: ItemStatus = "ordered"  # Individual item status

    @field_validator("size", mode="before")
    @classmethod
    def _trim_size(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if v == "":
                raise ValueError("size must not be empty when provided.")
        return v

    model_config = {"extra": "ignore"}


class OrderItemsCreate(OrderItemsBase):
    pass


class OrderItemsOut(OrderItemsBase):
    id: PyObjectId = Field(alias="_id")
    createdAt: datetime
    updatedAt: datetime
    order_status: Optional[str] = None  # Populated from parent order's status via order_status collection

    model_config = {
        "populate_by_name": True,
        "from_attributes": False,
        "json_encoders": {PyObjectId: str},
        "extra": "ignore",
    }