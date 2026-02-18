"""
Routes for managing Hero Images Mobile.
- Handles request parsing, RBAC, and delegates all logic to the service layer.
"""

from __future__ import annotations
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status, UploadFile, File, Form
from fastapi.responses import JSONResponse

from app.api.deps import require_permission, ip_rate_limiter
from app.schemas.object_id import PyObjectId
from app.schemas.hero_images_mobile import HeroImagesMobileUpdate, HeroImagesMobileOut
from app.services.hero_images_mobile import (
    create_item_service,
    list_items_service,
    get_item_service,
    update_item_service,
    delete_item_service,
)

router = APIRouter()


@router.post(
    "/",
    response_model=HeroImagesMobileOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("hero_images_mobile", "Create"))]
)
async def create_item(
    category: str = Form(...),
    idx: int = Form(...),
    image: UploadFile = File(None),
):
    """
    Create a hero image mobile.

    Notes:
    - Image (if provided) is streamed to GridFS; resulting `image_url` is stored.
    - Business rule: image is required; service returns 400 if omitted.
    - The combination of category+idx must be unique.

    Args:
        category: Category name for grouping hero images mobile.
        idx: Display order within category.
        image: Image file to upload (required by business rule).

    Returns:
        HeroImagesMobileOut: Newly created hero image mobile.
    """
    return await create_item_service(category=category, idx=idx, image=image)


@router.get("/", response_model=List[HeroImagesMobileOut], dependencies=[Depends(ip_rate_limiter)])
async def list_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by_idx: bool = Query(True, description="Sort by category+idx asc; fallback createdAt desc"),
    category: Optional[str] = Query(None, description="Filter by category"),
):
    """
    List hero images mobile with pagination and optional category filter.

    Args:
        skip: Offset for pagination.
        limit: Page size.
        sort_by_idx: Whether to sort by category+idx ascending.
        category: Optional category filter.

    Returns:
        List[HeroImagesMobileOut]
    """
    return await list_items_service(skip=skip, limit=limit, sort_by_idx=sort_by_idx, category=category)


@router.get("/{item_id}", response_model=HeroImagesMobileOut, dependencies=[Depends(ip_rate_limiter)])
async def get_item(item_id: PyObjectId):
    """
    Get a hero image mobile by ID.

    Args:
        item_id: Hero image mobile ObjectId.

    Returns:
        HeroImagesMobileOut

    Raises:
        404 if not found.
    """
    return await get_item_service(item_id)


@router.put(
    "/{item_id}",
    response_model=HeroImagesMobileOut,
    dependencies=[Depends(require_permission("hero_images_mobile", "Update"))]
)
async def update_item(
    item_id: PyObjectId,
    category: Optional[str] = Form(None),
    idx: Optional[int] = Form(None),
    image: UploadFile = File(None),
):
    """
    Update `category`, `idx` and/or replace image.

    If `image` is provided, the old GridFS image is replaced and `image_url` updated.

    Args:
        item_id: Hero image mobile ObjectId.
        category: Optional new category.
        idx: Optional new index.
        image: Optional new image file.

    Returns:
        HeroImagesMobileOut

    Raises:
        400 if no fields provided.
        404 if not found.
        409 on duplicate category+idx combination.
    """
    return await update_item_service(item_id=item_id, category=category, idx=idx, image=image)


@router.delete(
    "/{item_id}",
    dependencies=[Depends(require_permission("hero_images_mobile", "Delete"))]
)
async def delete_item(item_id: PyObjectId):
    """
    Delete a hero image mobile and its GridFS file if present.

    Args:
        item_id: Hero image mobile ObjectId.

    Returns:
        JSONResponse: {"deleted": True}
    """
    return await delete_item_service(item_id)
