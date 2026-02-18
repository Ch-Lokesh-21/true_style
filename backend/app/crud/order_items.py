from __future__ import annotations
from typing import List, Optional, Dict, Any
from bson import ObjectId

from app.core.database import db
from app.utils.mongo import stamp_create, stamp_update
from app.schemas.object_id import PyObjectId
from app.schemas.order_items import OrderItemsCreate, OrderItemsOut

COLL = "order_items"

def _to_out(doc: dict) -> OrderItemsOut:
    return OrderItemsOut.model_validate(doc)

async def create(payload: OrderItemsCreate) -> OrderItemsOut:
    doc = stamp_create(payload.model_dump(mode="python"))
    res = await db[COLL].insert_one(doc)
    saved = await db[COLL].find_one({"_id": res.inserted_id})
    return _to_out(saved)

async def list_all(
    skip: int = 0,
    limit: int = 50,
    query: Dict[str, Any] | None = None,
) -> List[OrderItemsOut]:
    """
    List order items with order_status populated from parent order.
    Uses aggregation to lookup through orders -> order_status.
    """
    pipeline = [
        {"$match": query or {}},
        {"$sort": {"createdAt": -1}},
        {"$skip": max(skip, 0)},
        {"$limit": max(limit, 1)},
        # Lookup the parent order to get status_id
        {"$lookup": {
            "from": "orders",
            "localField": "order_id",
            "foreignField": "_id",
            "as": "_order_doc"
        }},
        {"$addFields": {
            "_order_status_id": {"$arrayElemAt": ["$_order_doc.status_id", 0]}
        }},
        # Lookup the order_status to get status name
        {"$lookup": {
            "from": "order_status",
            "localField": "_order_status_id",
            "foreignField": "_id",
            "as": "_status_doc"
        }},
        {"$addFields": {
            "order_status": {"$arrayElemAt": ["$_status_doc.status", 0]}
        }},
        {"$project": {"_order_doc": 0, "_order_status_id": 0, "_status_doc": 0}}
    ]
    docs = await db[COLL].aggregate(pipeline).to_list(length=None)
    return [_to_out(d) for d in docs]


async def get_one(_id: PyObjectId) -> Optional[OrderItemsOut]:
    """
    Get a single order item with order_status populated from parent order.
    """
    try:
        oid = ObjectId(str(_id))
    except Exception:
        return None
    
    pipeline = [
        {"$match": {"_id": oid}},
        # Lookup the parent order to get status_id
        {"$lookup": {
            "from": "orders",
            "localField": "order_id",
            "foreignField": "_id",
            "as": "_order_doc"
        }},
        {"$addFields": {
            "_order_status_id": {"$arrayElemAt": ["$_order_doc.status_id", 0]}
        }},
        # Lookup the order_status to get status name
        {"$lookup": {
            "from": "order_status",
            "localField": "_order_status_id",
            "foreignField": "_id",
            "as": "_status_doc"
        }},
        {"$addFields": {
            "order_status": {"$arrayElemAt": ["$_status_doc.status", 0]}
        }},
        {"$project": {"_order_doc": 0, "_order_status_id": 0, "_status_doc": 0}}
    ]
    docs = await db[COLL].aggregate(pipeline).to_list(length=1)
    return _to_out(docs[0]) if docs else None

# async def update_one(_id: PyObjectId, payload: OrderItemsUpdate) -> Optional[OrderItemsOut]:
#     try:
#         oid = ObjectId(str(_id))
#     except Exception:
#         return None

#     data = {k: v for k, v in payload.model_dump(mode="python",exclude_none=True).items() if v is not None}
#     if not data:
#         return None

#     await db[COLL].update_one({"_id": oid}, {"$set": stamp_update(data)})
#     doc = await db[COLL].find_one({"_id": oid})
#     return _to_out(doc) if doc else None

async def delete_one(_id: PyObjectId) -> Optional[bool]:
    try:
        oid = ObjectId(str(_id))
    except Exception:
        return None
    r = await db[COLL].delete_one({"_id": oid})
    return r.deleted_count == 1
