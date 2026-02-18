import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs request metadata and response time for each API call."""
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        end = time.time()
        process_ms = round((end - start) * 1000, 2)
        log_data = {
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "time_ms": process_ms
        }
        return response