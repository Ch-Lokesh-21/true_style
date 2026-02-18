import hashlib
from app.core.config import settings

def hash_refresh(raw_token: str) -> str:
    """Hash a refresh token using SHA-256 before storing it in the database."""
    data = (raw_token + settings.TOKEN_HASH_PEPPER).encode("utf-8")
    return hashlib.sha256(data).hexdigest()