import asyncio
import json
from typing import Any, Optional, Dict
from redis import asyncio as redis_async  
from app.core.config import settings
from fastapi import Request
REDIS_URL = settings.REDIS_HOST
PERM_CACHE_TTL_SECONDS = settings.PERM_CACHE_TTL_SECONDS
_redis_client: Optional[redis_async.Redis] = None
_redis_lock = asyncio.Lock()

async def get_redis() -> redis_async.Redis:
    """
    Create or reuse a global Redis connection.
    We avoid checking internal .closed flags; instead we ping and recreate if needed.
    """
    global _redis_client
    async with _redis_lock:
        if _redis_client is None:
            _redis_client = redis_async.from_url(
                REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
            )
        else:
            try:
                await _redis_client.ping()
            except Exception:
                _redis_client = redis_async.from_url(
                    REDIS_URL,
                    encoding="utf-8",
                    decode_responses=True,
                )
    return _redis_client


async def close_redis():
    """Gracefully close Redis connection."""
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None




def _redis_key(role_id: Any, resource: str) -> str:
    return f"perm:{str(role_id)}:{resource.strip().lower()}"


async def get_cached_policy(role_id: Any, resource: str) -> Optional[Dict[str, bool]]:
    redis = await get_redis()
    val = await redis.get(_redis_key(role_id, resource))
    if not val:
        return None
    try:
        return json.loads(val)
    except json.JSONDecodeError:
        return None


async def set_cached_policy(role_id: Any, resource: str, policy: Dict[str, bool]) -> None:
    redis = await get_redis()
    await redis.setex(_redis_key(role_id, resource), PERM_CACHE_TTL_SECONDS, json.dumps(policy))


async def invalidate_permission_cache(
    role_id: Optional[Any] = None, resource: Optional[str] = None
) -> int:
    """
    Safely delete permission cache keys from Redis.
    - If both role_id and resource given → delete single key
    - If only one given → delete matching keys
    - If none → delete all 'perm:*' keys
    Returns count of deleted keys.
    """
    redis = await get_redis()

    if role_id and resource:
        await redis.delete(_redis_key(role_id, resource))
        return 1

    if role_id:
        pattern = f"perm:{role_id}:*"
    elif resource:
        pattern = f"perm:*:{resource.strip().lower()}"
    else:
        pattern = "perm:*"

    cursor = 0
    total_deleted = 0
    while True:
        cursor, keys = await redis.scan(cursor=cursor, match=pattern, count=500)
        if keys:
            try:
                await redis.unlink(*keys)
            except Exception:
                await redis.delete(*keys)
            total_deleted += len(keys)
        if cursor == 0:
            break

    return total_deleted


async def clear_permissions_cache() -> int:
    """Shortcut to delete all permission cache keys."""
    return await invalidate_permission_cache()


async def flush_entire_redis() -> None:
    """Dangerous: wipe the whole Redis DB (use only if DB is cache-only)."""
    redis = await get_redis()
    try:
        await redis.flushdb(asynchronous=True)
    except TypeError:
        await redis.flushdb()
        
def _otp_key(email: str) -> str:
    return f"{settings.FORGOT_PWD_OTP_PREFIX}{email.strip().lower()}"


def _otp_attempts_key(email: str) -> str:
    return f"{settings.FORGOT_PWD_OTP_ATTEMPTS_PREFIX}{email.strip().lower()}"

def _otp_rate_limit_key(email: str) -> str:
    return f"{settings.FORGOT_PWD_OTP_RATE_LIMIT_PREFIX}{email.strip().lower()}"

def _user_rate_key(user_id: str) -> str:
    """Redis key for per-user rate limiting."""
    return f"rl:user:{user_id}"


def _user_block_key(user_id: str) -> str:
    """Redis key for temporarily blocking suspicious users."""
    return f"rl:block:{user_id}"


def _user_strike_key(user_id: str) -> str:
    """Redis key for counting how many times user hit the limit."""
    return f"rl:strike:{user_id}"

def _ip_rate_key(ip: str) -> str:
    """Redis key for per-IP rate limiting."""
    return f"rl:ip:{ip}"


def _ip_block_key(ip: str) -> str:
    """Redis key for temporarily blocking abusive IPs."""
    return f"rl:ip:block:{ip}"


