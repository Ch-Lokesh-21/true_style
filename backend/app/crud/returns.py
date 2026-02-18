# app/crud/returns.py
from __future__ import annotations
from typing import List, Optional, Dict, Any
from bson import ObjectId

from app.core.database import db
from app.utils.mongo import stamp_create, stamp_update
from app.schemas.object_id import PyObjectId
from app.schemas.returns import ReturnsCreate, ReturnsUpdate, ReturnsOut

COLL = "returns"

def _to_out(doc: dict) -> ReturnsOut:
    return ReturnsOut.model_validate(doc)

def _to_oid(v: Any) -> ObjectId:
    """
    Coerce str/PyObjectId/ObjectId -> ObjectId, raise if invalid.
    Use where invalid IDs should be treated as 'not found'.
    """
    if isinstance(v, ObjectId):
        return v
    try:
        return ObjectId(str(v))
    except Exception:
        raise ValueError("Invalid ObjectId")

def _normalize_query(query: Dict[str, Any] | None) -> Dict[str, Any]:
    """
    Normalize common FK filters to ObjectId; support $in.
    Known OID fields: order_id, product_id, return_status_id, user_id, _id.
    """
    if not query:
        return {}
    q: Dict[str, Any] = {}
    oid_fields = {"_id", "order_id", "product_id", "return_status_id", "user_id"}
    for k, v in query.items():
        if v is None:
            continue
        if k in oid_fields:
            if isinstance(v, dict) and "$in" in v and isinstance(v["$in"], list):
                q[k] = {"$in": [ _to_oid(x) for x in v["$in"] ]}
            else:
                q[k] = _to_oid(v)
        else:
            q[k] = v
    return q

async def create(payload: ReturnsCreate) -> ReturnsOut:
    # mode="python" => PyObjectId fields become real ObjectId for Mongo
    doc = stamp_create(payload.model_dump(mode="python"))
    res = await db[COLL].insert_one(doc)
    # Use aggregation to get status name
    pipeline = [
        {"$match": {"_id": res.inserted_id}},
        {"$lookup": {
            "from": "return_status",
            "localField": "return_status_id",
            "foreignField": "_id",
            "as": "_status_doc"
        }},
        {"$addFields": {
            "return_status": {"$arrayElemAt": ["$_status_doc.status", 0]}
        }},
        {"$project": {"_status_doc": 0}}
    ]
    docs = await db[COLL].aggregate(pipeline).to_list(length=1)
    return _to_out(docs[0]) if docs else None

async def list_all(
    skip: int = 0,
    limit: int = 50,
    query: Dict[str, Any] | None = None,
) -> List[ReturnsOut]:
    q = _normalize_query(query)
    pipeline = [
        {"$match": q},
        {"$sort": {"createdAt": -1}},
        {"$skip": max(0, int(skip))},
        {"$limit": max(1, int(limit))},
        {"$lookup": {
            "from": "return_status",
            "localField": "return_status_id",
            "foreignField": "_id",
            "as": "_status_doc"
        }},
        {"$addFields": {
            "return_status": {"$arrayElemAt": ["$_status_doc.status", 0]}
        }},
        {"$project": {"_status_doc": 0}}
    ]
    docs = await db[COLL].aggregate(pipeline).to_list(length=limit)
    return [_to_out(d) for d in docs]

async def get_one(_id: PyObjectId) -> Optional[ReturnsOut]:
    try:
        oid = _to_oid(_id)
    except ValueError:
        return None
    pipeline = [
        {"$match": {"_id": oid}},
        {"$lookup": {
            "from": "return_status",
            "localField": "return_status_id",
            "foreignField": "_id",
            "as": "_status_doc"
        }},
        {"$addFields": {
            "return_status": {"$arrayElemAt": ["$_status_doc.status", 0]}
        }},
        {"$project": {"_status_doc": 0}}
    ]
    docs = await db[COLL].aggregate(pipeline).to_list(length=1)
    return _to_out(docs[0]) if docs else None

async def update_one(_id: PyObjectId, payload: ReturnsUpdate) -> Optional[ReturnsOut]:
    try:
        oid = _to_oid(_id)
    except ValueError:
        return None

    data = payload.model_dump(mode="python", exclude_none=True)
    if not data:
        return None

    await db[COLL].update_one({"_id": oid}, {"$set": stamp_update(data)})
    # Use aggregation to get status name
    pipeline = [
        {"$match": {"_id": oid}},
        {"$lookup": {
            "from": "return_status",
            "localField": "return_status_id",
            "foreignField": "_id",
            "as": "_status_doc"
        }},
        {"$addFields": {
            "return_status": {"$arrayElemAt": ["$_status_doc.status", 0]}
        }},
        {"$project": {"_status_doc": 0}}
    ]
    docs = await db[COLL].aggregate(pipeline).to_list(length=1)
    return _to_out(docs[0]) if docs else None

async def delete_one(_id: PyObjectId) -> Optional[bool]:
    try:
        oid = _to_oid(_id)
    except ValueError:
        return None
    r = await db[COLL].delete_one({"_id": oid})
    return r.deleted_count == 1