import traceback
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Catches unhandled exceptions globally and returns clean JSON error responses."""
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)

        except HTTPException as http_exc:
            error_log = {
                "method": request.method,
                "path": request.url.path,
                "status": http_exc.status_code,
                "detail": http_exc.detail
            }
            return JSONResponse(
                status_code=http_exc.status_code,
                content={"detail": http_exc.detail},
            )

        except Exception as exc:
            tb = traceback.format_exc()

            error_log = {
                "method": request.method,
                "path": request.url.path,
                "status": 500,
                "error": str(exc),
                "trace": tb,
            }

            return JSONResponse(
                status_code=500,
                content={"detail": "Internal Server Error"},
            )