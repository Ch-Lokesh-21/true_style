from pydantic import BaseModel
from typing import Optional

class MessageOut(BaseModel):
    message: str

class TokenOut(BaseModel):
    access_token: str
    access_jti: str
    access_exp: int
    token_type: str = "bearer"

class TokenRotatedOut(TokenOut):
    rotated: bool = True

class LoginPayload(BaseModel):
    """User payload returned in login response"""
    _id: str
    first_name: str
    last_name: str
    email: str
    role_id: str
    user_status_id: str
    user_role: Optional[str] = None
    wishlist_id: Optional[str] = None
    cart_id: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    access_jti: str
    access_exp: int
    payload: LoginPayload
    token_type: str = "bearer"
