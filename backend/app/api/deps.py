"""
Authorization & Authentication Dependencies

Provides:
- Access token validation
- Current user extraction
- Role & permission checking with Redis caching
- DB fallback for role-permission mapping
"""

from __future__ import annotations
from typing import Dict, Literal, Optional, Any
from fastapi import Depends, HTTPException, status, Header
from bson import ObjectId
from fastapi import Request
from app.core.security import decode_access_token
from app.core.database import db
from app.crud.token_revocations import is_revoked
from app.core.redis import get_cached_policy, set_cached_policy, get_redis, _user_block_key, _user_rate_key, _user_strike_key, _ip_block_key, _ip_rate_key
from app.utils.get_ip import _get_client_ip
from app.core.config import settings
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/oauth-login",  # your login route
    auto_error=False,        # handle missing tokens manually
)

UNAUTH = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Unauthorized",
    headers={"WWW-Authenticate": "Bearer"},
)
FORBID = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Forbidden: insufficient permissions",
)

Action = Literal["Create", "Read", "Update", "Delete"]


def _maybe_object_id(value) -> Any:
    """
    Internal helper:
    Convert a value to ObjectId if possible, otherwise return original value.
    Used to normalize role_id and other reference keys.
    """
    if isinstance(value, ObjectId):
        return value
    try:
        return ObjectId(str(value))
    except Exception:
        return value


async def _enforce_user_limit(user_id: str) -> None:
    """
    Per-user rate limit with suspicious activity detection.
    - If user exceeds USER_MAX_REQUESTS within USER_WINDOW_SECONDS,
      increment strike count.
    - If strikes exceed SUSPICIOUS_STRIKE_LIMIT, temporarily block user.
    """
    redis = await get_redis()

    # 1) Check if user is already blocked
    block_key = _user_block_key(user_id)
    is_blocked_ttl = await redis.ttl(block_key)

    if is_blocked_ttl and is_blocked_ttl > 0:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Suspicious activity detected. You are temporarily blocked.",
        )

    # 2) Normal per-user rate bucket
    rate_key = _user_rate_key(user_id)
    current = await redis.incr(rate_key)

    if current == 1:
        await redis.expire(rate_key, settings.USER_WINDOW_SECONDS)

    if current > settings.USER_MAX_REQUESTS:
        # User hit per-user limit in this window → mark a strike
        strike_key = _user_strike_key(user_id)
        strikes = await redis.incr(strike_key)

        # Ensure strike counter has some lifetime
        if strikes == 1:
            await redis.expire(strike_key, settings.SUSPICIOUS_BLOCK_SECONDS)

        # If too many strikes, block the user for a longer period
        if strikes >= settings.SUSPICIOUS_STRIKE_LIMIT:
            await redis.setex(
                block_key,
                settings.SUSPICIOUS_BLOCK_SECONDS,
                "1",
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Suspicious activity detected. You are temporarily blocked.",
            )

        # If under strike limit, still reject this request
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please slow down.",
        )

async def ip_rate_limiter(request: Request) -> None:
    """
    Per-IP rate limiter for unauthenticated routes.

    Applies:
      - Simple sliding-window style limit using Redis INCR + EXPIRE
      - Temporary block if IP is abusing the endpoint

    Usage:
        @router.post("/auth/login", dependencies=[Depends(ip_rate_limiter)])
        async def login(...):
            ...

        @router.post("/auth/forgot-password", dependencies=[Depends(ip_rate_limiter)])
        async def forgot_password(...):
            ...
    """
    ip = _get_client_ip(request)
    redis = await get_redis()

    # 1) Check if IP is currently blocked
    block_key = _ip_block_key(ip)
    is_blocked_ttl = await redis.ttl(block_key)

    if is_blocked_ttl and is_blocked_ttl > 0:
        # Still blocked
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests from this IP. Please try again later.",
        )

    # 2) Normal per-IP bucket
    rate_key = _ip_rate_key(ip)
    current = await redis.incr(rate_key)

    # First hit: set TTL for this window
    if current == 1:
        await redis.expire(rate_key, settings.IP_WINDOW_SECONDS)

    # 3) Over limit → set block key and reject
    if current > settings.IP_MAX_REQUESTS:
        # Block this IP for a while
        await redis.setex(block_key, settings.IP_BLOCK_SECONDS, "1")

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests from this IP. You are temporarily blocked.",
        )

    # If under limit → silently allow request (just return None)

# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

async def get_access_token(token: str | None = Depends(oauth2_scheme)) -> str:
    """
    Use OAuth2PasswordBearer to extract Bearer token from the Authorization header.

    Header format:
        Authorization: Bearer <token>
    """
    if not token:
        # Missing/invalid Authorization header
        raise UNAUTH
    return token


async def get_optional_access_token(
    authorization: Optional[str] = Header(default=None)
) -> Optional[str]:
    """
    Extract Bearer token from Authorization header, but don't raise error if missing.
    Used for endpoints like logout that should work even without valid tokens.
    
    Header format:
        Authorization: Bearer <token>
    """
    if not authorization:
        return None
    
    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    
    return None

async def get_current_user(token: str = Depends(get_access_token)) -> Dict:
    """
    Dependency: Extract and validate the currently authenticated user
    from a Bearer access token.

    Also applies:
        - Per-user rate limit (based on user_id)
        - Suspicious activity blocking (temporary block on repeated limit hits)
    """

    payload = decode_access_token(token)

    if not payload or payload.get("type") != "access":
        raise UNAUTH

    # Check revocation (logout / forced logout / security)
    if await is_revoked(payload.get("jti", "")):
        raise UNAUTH

    required = ["user_id", "user_role_id", "user_role", "wishlist_id", "cart_id"]
    if not all(k in payload for k in required):
        raise UNAUTH

    user_id = str(payload["user_id"])

    # Per-user rate limiter + suspicious detection
    await _enforce_user_limit(user_id)

    return {k: payload[k] for k in required}


# ---------------------------------------------------------------------------
# Permission Lookup (DB fallback when Redis lacks policy)
# ---------------------------------------------------------------------------

async def _fetch_policy_from_db(role_id: Any, resource: str) -> Optional[Dict[str, bool]]:
    """
    Query MongoDB for a role's permission policy for a given resource.

    Steps:
        1. Look up permission documents for:
           - resource_name = resource
           - resource_name = "user:{resource}" (user-scoped override)
        2. Find the role_permission link
        3. Extract CRUD flags

    Returns:
        Dict of {"Create": bool, "Read": bool, "Update": bool, "Delete": bool}
        OR None if no permission found.
    """
    cursor = db["permissions"].find(
        {"resource_name": {"$in": [resource, f"user:{resource}"]}},
        projection={"_id": 1, "resource_name": 1, "Create": 1, "Read": 1, "Update": 1, "Delete": 1},
    )
    perms = await cursor.to_list(length=3)
    if not perms:
        return None

    perm_ids = [p["_id"] for p in perms]
    link = await db["role_permissions"].find_one(
        {"role_id": _maybe_object_id(role_id), "permission_id": {"$in": perm_ids}},
        projection={"permission_id": 1},
    )
    if not link:
        return None

    matched = next((p for p in perms if p["_id"] == link["permission_id"]), None)
    if not matched:
        return None

    return {
        "Create": bool(matched.get("Create", False)),
        "Read": bool(matched.get("Read", False)),
        "Update": bool(matched.get("Update", False)),
        "Delete": bool(matched.get("Delete", False)),
    }


# ---------------------------------------------------------------------------
# Authorization Dependency
# ---------------------------------------------------------------------------

def require_permission(resource: str, action: Action, role: Optional[str] = None):
    """
    Dependency factory for route-level authorization.

    Args:
        resource (str): Resource name defined in permissions collection
                        (e.g., "users", "products", "coupons")
        action (Literal): One of ["Create", "Read", "Update", "Delete"]
        role (Optional[str]): If "admin", enforce admin-only access without DB lookup.

    Usage:
        @router.get("/items", dependencies=[Depends(require_permission("products","Read"))])
        @router.post("/admin", dependencies=[Depends(require_permission("users","Create","admin"))])

    Returns:
        A dependency function which:
          - Validates current user via get_current_user
          - If admin-only, checks role="admin"
          - Otherwise loads permission policy from Redis cache, falling back to MongoDB
          - Raises 403 if action is not permitted
    """

    # Admin-only override
    if role is not None and role != "" and role == "admin":
        async def _admin_dep(current: Dict = Depends(get_current_user)) -> Dict:
            role_id = current["user_role_id"]
            get_role = await db["user_roles"].find_one({"_id": _maybe_object_id(role_id)})
            if not get_role or get_role.get("role") != "admin":
                raise FORBID
            return current
        return _admin_dep

    # Standard permission dependency
    async def _dep(current: Dict = Depends(get_current_user)) -> Dict:
        role_id = current["user_role_id"]

        # 1. Try Redis lookup
        policy = await get_cached_policy(role_id, resource)

        # 2. Cache miss → DB lookup + set cache
        if policy is None:
            policy = await _fetch_policy_from_db(role_id, resource)
            if policy is None:
                raise FORBID
            await set_cached_policy(role_id, resource, policy)

        # 3. Check if the requested action is allowed
        if not policy.get(action, False):
            raise FORBID

        return current

    return _dep