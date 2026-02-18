# app/schemas/hero_images_mobile.py
from typing import Optional, Annotated
from datetime import datetime

from pydantic import BaseModel, Field, AnyUrl, TypeAdapter, field_validator
from app.schemas.object_id import PyObjectId

Idx = Annotated[int, Field(ge=0, le=1_000_000, description="Display order; non-negative.")]
ImageStr = Annotated[str, Field(max_length=2048, description="Image URL as plain string.")]
Category = Annotated[str, Field(min_length=1, max_length=100, description="Category name for grouping hero images mobile.")]

_URL = TypeAdapter(AnyUrl)  # validates http/https, localhost, custom ports, etc.


class HeroImagesMobileBase(BaseModel):
    category: Category
    idx: Idx
    image_url: ImageStr

    @field_validator("image_url", mode="before")
    @classmethod
    def _validate_image_url(cls, v):
        # Validate as URL, then return plain str (Mongo-safe)
        return str(_URL.validate_python(v))

    model_config = {"extra": "ignore"}


class HeroImagesMobileCreate(HeroImagesMobileBase):
    pass


class HeroImagesMobileUpdate(BaseModel):
    category: Optional[Category] = None
    idx: Optional[Idx] = None
    image_url: Optional[ImageStr] = None

    @field_validator("image_url", mode="before")
    @classmethod
    def _validate_image_url(cls, v):
        if v is None:
            return v
        return str(_URL.validate_python(v))

    model_config = {"extra": "ignore"}


class HeroImagesMobileOut(HeroImagesMobileBase):
    id: PyObjectId = Field(alias="_id")
    createdAt: datetime
    updatedAt: datetime

    model_config = {
        "populate_by_name": True,
        "from_attributes": False,
        "json_encoders": {PyObjectId: str},
        "extra": "ignore",
    }
