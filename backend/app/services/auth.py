from __future__ import annotations
from typing import Optional
from datetime import datetime, timezone
import random

from bson import ObjectId
from fastapi import HTTPException, Depends, status, Request, Response

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.redis import get_redis, _otp_key, _otp_attempts_key, _otp_rate_limit_key
from app.core.database import db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    hash_password,
    decode_access_token,
    decode_refresh_token,
)
from app.core.config import settings
from app.api.deps import get_current_user
from app.utils.tokens import hash_refresh
from app.crud.sessions import (
    create_session,
    get_by_refresh_hash,
    revoke_session_by_jti,
)
from app.crud.token_revocations import add_revocation, is_revoked
from app.crud import users as crud
from app.crud import carts as carts_crud
from app.crud import wishlists as wishlists_crud
from app.schemas.users import UserOut, UserCreate
from app.schemas.carts import CartsCreate
from app.schemas.wishlists import WishlistsCreate
from app.schemas.responses import MessageOut, TokenRotatedOut, LoginResponse
from app.schemas.requests import (
    LoginIn,
    ChangePasswordIn,
    ForgotPasswordRequestIn,
    ForgotPasswordVerifyIn,
    RegisterIn,
)
from app.utils.fastapi_mail import _send_mail, generate_otp_email_html

# logging helpers
from app.services.log_writer import write_login_log, write_logout_log, write_register_log
from app.schemas.logs import LoginLogCreate, LogoutLogCreate, RegisterLogCreate


# -------------------------------------------------
# Helpers
# -------------------------------------------------

def _unix_to_dt(ts: int) -> datetime:
    """Convert UNIX timestamp to timezone-aware UTC datetime."""
    return datetime.fromtimestamp(ts, tz=timezone.utc)


def _set_refresh_cookie(response: Response, token: str, exp_ts: int) -> None:
    """Attach refresh token to HTTP-only secure cookie."""
    max_age = settings.REFRESH_COOKIE_MAX_AGE_DAYS * 86400
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.REFRESH_COOKIE_SECURE,
        samesite=settings.REFRESH_COOKIE_SAMESITE,
        max_age=max_age,
        expires=exp_ts,
        path=settings.REFRESH_COOKIE_PATH,
    )


def _clear_refresh_cookie(response: Response) -> None:
    """Delete refresh-token cookie."""
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        path=settings.REFRESH_COOKIE_PATH,
    )


# ---------- Compensation helpers ----------

async def _restore_last_login(user_id: ObjectId, old_value: Optional[datetime]):
    """Restore last_login to the previous value (or unset if None)."""
    if old_value is None:
        await db["users"].update_one({"_id": user_id}, {"$unset": {"last_login": ""}})
    else:
        await db["users"].update_one({"_id": user_id}, {"$set": {"last_login": old_value}})


async def _delete_user_safely(user_id: ObjectId):
    """Delete a newly created user (register compensation)."""
    await db["users"].delete_one({"_id": user_id})


async def _delete_cart_safely(user_id: ObjectId):
    """Delete cart for compensation."""
    await db["carts"].delete_one({"user_id": user_id})


async def _delete_wishlist_safely(user_id: ObjectId):
    """Delete wishlist for compensation."""
    await db["wishlists"].delete_one({"user_id": user_id})


# -------------------------------------------------
# Auth Services (with logical transactions)
# -------------------------------------------------

async def login_service(
    response: Response,
    request: Request,
    body: LoginIn,
    session: AsyncSession | None = None,
) -> LoginResponse:
    """
    Authenticate a user; if any step after bumping last_login fails,
    restore the original last_login (logical transaction).
    """
    try:
        email = body.email
        user = await db["users"].find_one({"email": email})
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
        elif not verify_password(body.password, user.get("password", "")):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

        user_status = await db["user_status"].find_one({"status": "blocked"})
        if str(user["user_status_id"]) == str(user_status["_id"]):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "User account is suspended")

        # Capture previous last_login for compensation
        prev_last_login: Optional[datetime] = user.get("last_login")

        # Update last login timestamp
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}},
        )

        try:
            # Find or create wishlist for the user
            wishlist = await db["wishlists"].find_one({"user_id": ObjectId(user["_id"])})
            if not wishlist:
                # Auto-create wishlist for existing users who registered before this fix
                new_wishlist = await wishlists_crud.create(WishlistsCreate(user_id=str(user["_id"])))
                wishlist = await db["wishlists"].find_one({"_id": ObjectId(str(new_wishlist.id))})
            
            # Find or create cart for the user
            cart = await db["carts"].find_one({"user_id": ObjectId(user["_id"])})
            if not cart:
                # Auto-create cart for existing users who registered before this fix
                new_cart = await carts_crud.create(CartsCreate(user_id=str(user["_id"])))
                cart = await db["carts"].find_one({"_id": ObjectId(str(new_cart.id))})
            
            role = await db["user_roles"].find_one({"_id": ObjectId(user["role_id"])})
            
            payload = {
                "user_id": str(user["_id"]),
                "user_role_id": str(user["role_id"]),
                "user_role": role.get("role") if role else None,
                "wishlist_id": str(wishlist["_id"]) if wishlist else None,
                "cart_id": str(cart["_id"]) if cart else None,
                "type": "access_payload",
            }

            at = create_access_token(payload)
            rt = create_refresh_token(
                {
                    "user_id": payload["user_id"],
                    "user_role_id": payload["user_role_id"],
                    "user_role": payload.get("user_role"),
                    "wishlist_id": payload["wishlist_id"],
                    "cart_id": payload["cart_id"],
                }
            )

            # Create session record (DB for refresh tokens)
            sess = {
                "user_id": payload["user_id"],
                "jti": rt["jti"],
                "refresh_hash": hash_refresh(rt["token"]),
                "exp": _unix_to_dt(rt["exp"]),
                "ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            }
            await create_session(sess)

            _set_refresh_cookie(response, rt["token"], rt["exp"])

            # Write login log
            await write_login_log(
                LoginLogCreate(
                    user_id=str(user["_id"]),
                    first_name=user.get("first_name", ""),
                    last_name=user.get("last_name", ""),
                    email=user.get("email", ""),
                ),
                session=session,
            )

            return LoginResponse(
                access_token=at["token"],
                access_jti=at["jti"],
                access_exp=at["exp"],
                payload={
                    "_id": str(user["_id"]),
                    "first_name": user.get("first_name", ""),
                    "last_name": user.get("last_name", ""),
                    "email": user.get("email", ""),
                    "role_id": str(user["role_id"]),
                    "user_status_id": str(user["user_status_id"]),
                    "user_role": payload.get("user_role"),
                    "wishlist_id": payload["wishlist_id"],
                    "cart_id": payload["cart_id"],
                },
            )

        except Exception as inner_err:
            # COMPENSATE: restore last_login if anything failed after update
            await _restore_last_login(user["_id"], prev_last_login)
            raise inner_err

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal Server Error")


async def register_service(
    payload: RegisterIn,
    session: AsyncSession | None = None,
) -> UserOut:
    """
    Register a new user; if the register-log insertion fails,
    delete the newly created user (logical transaction).
    """
    email = payload.email
    try:
        if await db["users"].find_one({"email": email}):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")

        if await db["users"].find_one(
            {"phone_no": payload.phone_no, "country_code": payload.country_code}
        ):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Phone number already registered")

        # Defaults
        role = await db["user_roles"].find_one({"role": "user"})
        if not role:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Default user role not found")

        status_doc = await db["user_status"].find_one({"status": "active"})
        if not status_doc:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Default user status not found")

        # Build DB record using Pydantic UserCreate
        doc = UserCreate(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            password=payload.password,
            country_code=payload.country_code,
            phone_no=payload.phone_no,
            role_id=str(role["_id"]),
            user_status_id=status_doc["_id"],
            last_login=None,
        )

        # Create user (Mongo) first; returns Pydantic UserOut
        new_user = await crud.create(doc)
        user_oid = ObjectId(str(new_user.id))

        cart_created = False
        wishlist_created = False

        try:
            # Create cart for the new user
            await carts_crud.create(CartsCreate(user_id=str(user_oid)))
            cart_created = True

            # Create wishlist for the new user
            await wishlists_crud.create(WishlistsCreate(user_id=str(user_oid)))
            wishlist_created = True

            # Insert register log (Postgres)
            await write_register_log(
                RegisterLogCreate(
                    user_id=str(new_user.id),
                    first_name=new_user.first_name,
                    last_name=new_user.last_name,
                    email=new_user.email,
                ),
                session=session,
            )
        except Exception as log_err:
            # COMPENSATE: delete cart, wishlist, and user
            if wishlist_created:
                await _delete_wishlist_safely(user_oid)
            if cart_created:
                await _delete_cart_safely(user_oid)
            await _delete_user_safely(user_oid)
            raise log_err

        return new_user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Error during registration")


async def refresh_token_service(response: Response, request: Request, rt: Optional[str]) -> TokenRotatedOut:
    """Rotate refresh token and set new cookie."""
    try:
        if not rt:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No refresh cookie")

        payload = decode_refresh_token(rt)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")

        if await is_revoked(payload.get("jti", "")):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token revoked")

        sess_db = await get_by_refresh_hash(hash_refresh(rt))
        if not sess_db:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session not found or revoked")

        # Revoke previous refresh
        await revoke_session_by_jti(sess_db["jti"], reason="refresh-used")
        await add_revocation(
            sess_db["jti"],
            expiresAt=_unix_to_dt(payload["exp"]),
            reason="refresh-used",
        )

        new_payload = {
            "user_id": payload["user_id"],
            "user_role_id": payload["user_role_id"],
            "user_role": payload.get("user_role"),
            "wishlist_id": payload["wishlist_id"],
            "cart_id": payload["cart_id"],
        }

        at = create_access_token(new_payload)
        new_rt = create_refresh_token(new_payload)

        await create_session(
            {
                "user_id": new_payload["user_id"],
                "jti": new_rt["jti"],
                "refresh_hash": hash_refresh(new_rt["token"]),
                "exp": _unix_to_dt(new_rt["exp"]),
                "ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            }
        )

        _set_refresh_cookie(response, new_rt["token"], new_rt["exp"])

        return TokenRotatedOut(
            access_token=at["token"],
            access_jti=at["jti"],
            access_exp=at["exp"],
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal Server Error")


async def logout_service(
    response: Response,
    request: Request,
    rt: Optional[str],
    access_token: Optional[str],
    session: AsyncSession | None = None,
) -> MessageOut:
    """Logout; non-atomic per your requirement (no compensation)."""
    try:
        # Revoke access token
        user_id: Optional[str] = None
        if access_token:
            ap = decode_access_token(access_token)
            if ap and ap.get("type") == "access":
                user_id = ap.get("user_id")
                await add_revocation(
                    ap.get("jti", ""),
                    expiresAt=_unix_to_dt(ap["exp"]),
                    reason="logout-access",
                )

        # Revoke refresh token
        if rt:
            rp = decode_refresh_token(rt)
            if rp and rp.get("type") == "refresh":
                sess_db = await get_by_refresh_hash(hash_refresh(rt))
                if sess_db:
                    await revoke_session_by_jti(sess_db["jti"], reason="logout-refresh")
                    await add_revocation(
                        sess_db["jti"],
                        expiresAt=_unix_to_dt(rp["exp"]),
                        reason="logout-refresh",
                    )

        # Write logout log if we can resolve the user
        if user_id:
            udoc = await db["users"].find_one({"_id": ObjectId(user_id)})
            if udoc:
                await write_logout_log(
                    LogoutLogCreate(
                        user_id=str(udoc["_id"]),
                        first_name=udoc.get("first_name", ""),
                        last_name=udoc.get("last_name", ""),
                        email=udoc.get("email", ""),
                    ),
                    session=session,
                )

        _clear_refresh_cookie(response)
        return MessageOut(message="Logged out successfully")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal Server Error")


async def change_password_service(current=Depends(get_current_user), body: ChangePasswordIn = ...) -> MessageOut:
    """Change password."""
    try:
        user = await db["users"].find_one({"_id": ObjectId(current["user_id"])})
        if not user or not verify_password(body.old_password, user.get("password", "")):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")

        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"password": hash_password(body.new_password)}},
        )
        return MessageOut(message="Password updated")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal Server Error")


async def forgot_password_request_service(body: ForgotPasswordRequestIn) -> MessageOut:
    """Generate OTP and email it for password reset (OTP in Redis, 5m TTL, rate-limited)."""
    try:
        email = body.email.strip().lower()

        # 1. Make sure user exists
        user = await db["users"].find_one({"email": email})
        if not user:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "User not found"
            )

        redis = await get_redis()
        rl_key = _otp_rate_limit_key(email)

        remaining_cooldown = await redis.ttl(rl_key)
        if remaining_cooldown and remaining_cooldown > 0:
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                f"Please wait {remaining_cooldown} seconds before requesting a new OTP"
            )

        otp = random.randint(100000, 999999)

        await redis.setex(
            _otp_key(email),
            settings.FORGOT_PWD_OTP_TTL_SECONDS,
            str(otp),
        )

        attempts_key = _otp_attempts_key(email)
        await redis.delete(attempts_key)

        await redis.setex(
            rl_key,
            settings.FORGOT_PWD_RESEND_COOLDOWN_SECONDS,
            "1",
        )
        await _send_mail(
            subject="Password Reset OTP",
            recipients=[email],
            body=generate_otp_email_html(otp)
        )

        return MessageOut(message="OTP sent")

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Internal Server Error"
        )


async def forgot_password_verify_service(body: ForgotPasswordVerifyIn) -> MessageOut:
    """Verify OTP from Redis with attempt limit, then reset password."""
    try:
        email = body.email.strip().lower()
        otp_key = _otp_key(email)
        attempts_key = _otp_attempts_key(email)

        redis = await get_redis()

        stored_otp = await redis.get(otp_key)
        if not stored_otp:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Invalid or expired OTP"
            )

        if stored_otp != str(body.otp):
            attempts = await redis.incr(attempts_key)

            if attempts == 1:
                await redis.expire(attempts_key, settings.FORGOT_PWD_OTP_TTL_SECONDS)

            if attempts >= settings.FORGOT_PWD_MAX_OTP_ATTEMPTS:
                await redis.delete(otp_key)
                await redis.delete(attempts_key)
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    "Too many invalid attempts. Please request a new OTP."
                )

            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Invalid OTP"
            )

        user = await db["users"].find_one({"email": email})
        if not user:
            await redis.delete(otp_key)
            await redis.delete(attempts_key)
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "User not found"
            )

        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"password": hash_password(body.new_password)}},
        )

        await redis.delete(otp_key)
        await redis.delete(attempts_key)

        return MessageOut(message="Password reset successful")

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Internal Server Error"
        )