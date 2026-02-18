from datetime import datetime, timezone
import logging

from app.core.database import db

_LOG = logging.getLogger("app.tasks.cleanup")


async def delete_expired_revocations() -> int:
    """Delete expired JTIs from the token_revocations collection.

    Returns number of documents deleted.
    """
    now = datetime.now(timezone.utc)
    res = await db["token_revocations"].delete_many({"expiresAt": {"$lte": now}})
    return res.deleted_count


async def delete_expired_sessions() -> int:
    """Delete expired sessions (refresh tokens) from the sessions collection.

    Returns number of documents deleted.
    """
    now = datetime.now(timezone.utc)
    res = await db["sessions"].delete_many({"exp": {"$lte": now}})
    return res.deleted_count


async def cleanup_job():
    """APScheduler job: cleanup expired revocations and sessions."""
    try:
        rev_del = await delete_expired_revocations()
        sess_del = await delete_expired_sessions()
        if rev_del or sess_del:
            _LOG.info("Cleanup removed expired revocations=%s sessions=%s", rev_del, sess_del)
        else:
            _LOG.debug("Cleanup ran, no expired documents found")
    except Exception:
        _LOG.exception("Error during cleanup job")
