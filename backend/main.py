from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.core.config import settings
from app.core.database import Base, engine, close_engine, close_mongo_connection
from app.core.redis import clear_permissions_cache, close_redis
from app import main as api_main  
from templates import swagger
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.tasks import cleanup
from app.core.config import settings

logger = logging.getLogger("app.validation")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown lifecycle."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await clear_permissions_cache()
    
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        cleanup.cleanup_job,
        'interval',
        minutes=settings.CLEANUP_INTERVAL_MINUTES,
        id='cleanup_expired_tokens',
        replace_existing=True,
        max_instances=1
    )
    scheduler.start()
    logging.getLogger("app").info(
        "Started cleanup scheduler (interval=%s minutes)",
        settings.CLEANUP_INTERVAL_MINUTES
    )

    yield

    scheduler.shutdown(wait=True)
    await close_mongo_connection()
    await close_redis()
    await close_engine()


app = FastAPI(
    title=settings.PROJECT_NAME,
    swagger_ui_oauth2_redirect_url="/docs/oauth2-redirect",
    docs_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(ErrorHandlerMiddleware)

app.include_router(api_main.router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Log detailed validation errors to help debug 422 responses."""
    errors = exc.errors()
    
    # Log each validation error with full details
    logger.error("=" * 60)
    logger.error(f"VALIDATION ERROR on {request.method} {request.url.path}")
    logger.error("=" * 60)
    
    for error in errors:
        field_loc = " -> ".join(str(loc) for loc in error.get("loc", []))
        error_type = error.get("type", "unknown")
        error_msg = error.get("msg", "No message")
        error_input = error.get("input", "N/A")
        
        logger.error(f"  Field: {field_loc}")
        logger.error(f"  Type: {error_type}")
        logger.error(f"  Message: {error_msg}")
        logger.error(f"  Input Value: {error_input} (type: {type(error_input).__name__})")
        logger.error("-" * 40)
    
    logger.error("=" * 60)
    
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )


@app.get("/docs", include_in_schema=False)
def custom_docs():
    return HTMLResponse(content=swagger.html)

@app.get("/", tags=["Root"])
async def root():
    return {"message": f"{settings.PROJECT_NAME} is running"}