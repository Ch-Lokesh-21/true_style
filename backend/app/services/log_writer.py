# app/services/log_writer.py
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.crud.logs import (
    create_login_log,
    create_logout_log,
    create_register_log,
)
from app.schemas.logs import LoginLogCreate, LogoutLogCreate, RegisterLogCreate


async def write_login_log(payload: LoginLogCreate, session: Optional[AsyncSession] = None):
    if session is not None:
        await create_login_log(session, payload)
        return
    async with AsyncSessionLocal() as s:
        await create_login_log(s, payload)


async def write_logout_log(payload: LogoutLogCreate, session: Optional[AsyncSession] = None):
    if session is not None:
        await create_logout_log(session, payload)
        return
    async with AsyncSessionLocal() as s:
        await create_logout_log(s, payload)


async def write_register_log(payload: RegisterLogCreate, session: Optional[AsyncSession] = None):
    if session is not None:
        await create_register_log(session, payload)
        return
    async with AsyncSessionLocal() as s:
        await create_register_log(s, payload)